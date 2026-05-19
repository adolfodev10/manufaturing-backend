import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const GetBackupConfig = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/backups/config", {},
        async (req, reply) => {
            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

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
                            tables: JSON.stringify(["users", "clients", "dividas", "products", "sales"]),
                            compression: true,
                            encryption: false,
                        },
                    });

                    const duration = Date.now() - startTime;

                    await logger.success({
                        action: "Criar Config Backup",
                        user,
                        user_id: userId,
                        details: "Configuração padrão de backup criada automaticamente",
                        ip,
                        resource: "backups",
                        duration,
                    });
                }

                const configToReturn = {
                    ...config,
                    tables: config.tables ? JSON.parse(config.tables) : [],
                    next_run: config.next_run,
                    last_run: config.last_run,
                };

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Config Backup",
                    user,
                    user_id: userId,
                    details: "Configurações de backup consultadas",
                    ip,
                    resource: "backups",
                    duration,
                });

                return reply.status(200).send(configToReturn);

            } catch (error) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Listar Config Backup",
                    user,
                    user_id: userId,
                    details: `Erro ao buscar configurações de backup: ${(error as Error).message}`,
                    ip,
                    resource: "backups",
                    duration,
                });

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
            const startTime = Date.now();
            const config = req.body;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                // Buscar configuração anterior para log de alterações
                const oldConfig = await prisma.backupConfig.findFirst();

                // Calcular próximo backup
                const next_run = calculateNextRun(config);

                const dataToSave = {
                    ...config,
                    tables: JSON.stringify(config.tables),
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

                const duration = Date.now() - startTime;

                // Montar detalhes das alterações
                const alteracoes: string[] = [];
                
                if (oldConfig) {
                    if (oldConfig.enabled !== config.enabled) {
                        alteracoes.push(`Backup ${config.enabled ? 'ativado' : 'desativado'}`);
                    }
                    if (oldConfig.frequency !== config.frequency) {
                        alteracoes.push(`Frequência: ${oldConfig.frequency} → ${config.frequency}`);
                    }
                    if (oldConfig.time !== config.time) {
                        alteracoes.push(`Horário: ${oldConfig.time} → ${config.time}`);
                    }
                    if (oldConfig.retention_days !== config.retention_days) {
                        alteracoes.push(`Retenção: ${oldConfig.retention_days} → ${config.retention_days} dias`);
                    }
                    
                    const oldTables = oldConfig.tables ? JSON.parse(oldConfig.tables as string) : [];
                    const newTables = config.tables;
                    
                    if (JSON.stringify(oldTables.sort()) !== JSON.stringify(newTables.sort())) {
                        alteracoes.push(`Tabelas alteradas: ${newTables.length} tabelas selecionadas`);
                    }
                    
                    if (oldConfig.compression !== config.compression) {
                        alteracoes.push(`Compressão: ${config.compression ? 'ativada' : 'desativada'}`);
                    }
                    if (oldConfig.encryption !== config.encryption) {
                        alteracoes.push(`Encriptação: ${config.encryption ? 'ativada' : 'desativada'}`);
                    }
                }

                await logger.success({
                    action: "Salvar Config Backup",
                    user,
                    user_id: userId,
                    details: oldConfig 
                        ? `Configuração de backup atualizada. Alterações: ${alteracoes.join('; ') || 'Nenhuma alteração detectada'}`
                        : "Configuração de backup criada pela primeira vez",
                    ip,
                    resource: "backups",
                    duration,
                });

                return reply.status(200).send(response);

            } catch (error) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Salvar Config Backup",
                    user,
                    user_id: userId,
                    details: `Erro ao salvar configurações de backup: ${(error as Error).message}`,
                    ip,
                    resource: "backups",
                    duration,
                });

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