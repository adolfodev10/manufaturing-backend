import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { table } from "console";

export const GetBackupConfig = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/backups/config", {},
        async (req, reply) => {
            try {
                let config = await prisma.backupConfig.findFirst();

                if (!config) {
                    // Criar configuração padrão
                    config = await prisma.backupConfig.create({
                        data: {
                            enabled: true,
                            frequency: "daily",
                            time: "02:00",
                            retention_days: 30,
                            tables: JSON.stringify(["users", "clients", "invoices", "products", "sales"]),
                            compression: true,
                            encryption: false,
                        },
                    });
                }
                const configToReturn = {
                    ...config,
                    tables:config.tables ? JSON.parse(config.tables) : [],
                    next_run: config.next_run,
                    last_run: config.last_run,
                };

                return reply.status(200).send(configToReturn);

            } catch (error) {
                console.error("Erro ao buscar configurações:", error);
                return reply.status(500).send({ error: "Erro ao buscar configurações" });
            }
        }
    );
};

export const SaveBackupConfig = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/backups/config", {
        schema: {
            body: z.object({
                enabled: z.boolean(),
                frequency: z.enum(["hourly", "daily", "weekly", "monthly"]),
                time: z.string(),
                dayOfWeek: z.number().optional(),
                dayOfMonth: z.number().optional(),
                retention_days: z.number(),
                tables: z.array(z.string()),
                compression: z.boolean(),
                encryption: z.boolean(),
                notification_email: z.string().email().optional(),
            }),
        },
    },
        async (req, reply) => {
            const config = req.body;

            try {
                // Calcular próximo backup
                const next_run = calculateNextRun(config);

                const dataToSave = {
                    ...config,
                    tables: JSON.stringify(config.tables), // <-- Array -> String
                    next_run,
                    updated_at: new Date(),
                };

                const updated = await prisma.backupConfig.upsert({
                    where: { id: "1" },
                    update: dataToSave,
                    create: {
                        id: "1",
                        ...dataToSave,
                    },
                });

                 // CONVERTER de volta para array na resposta
                const response = {
                    ...updated,
                    tables: updated.tables ? JSON.parse(updated.tables) : [],
                };

                return reply.status(200).send(response);

            } catch (error) {
                console.error("Erro ao salvar configurações:", error);
                return reply.status(500).send({ error: "Erro ao salvar configurações" });
            }
        }
    );
};

function calculateNextRun(config: any): Date {
    const now = new Date();
    const [hours, minutes] = config.time.split(':').map(Number);
    
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
        next.setDate(next.getDate() + 1);
    }

    if (config.frequency === 'weekly' && config.dayOfWeek !== undefined) {
        const currentDay = next.getDay();
        const targetDay = config.dayOfWeek;
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd < 0) daysToAdd += 7;
        next.setDate(next.getDate() + daysToAdd);
    }

    if (config.frequency === 'monthly' && config.dayOfMonth !== undefined) {
        next.setDate(config.dayOfMonth);
        if (next <= now) {
            next.setMonth(next.getMonth() + 1);
        }
    }

    return next;
}