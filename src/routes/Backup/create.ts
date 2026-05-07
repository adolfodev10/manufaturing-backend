import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { format } from "date-fns";

export const CreateBackup = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/backups/create", {
        schema: {
            body: z.object({
                name: z.string(),
                tables: z.array(z.string()).optional(),
                compression: z.boolean().default(true),
                encryption: z.boolean().default(false),
                includeMedia: z.boolean().default(false),
            }),
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { name, tables, compression, encryption, includeMedia } = req.body;
            const user = (req as any).user?.email || 'sistema';
            const userId = (req as any).user?.id;

            try {
                // Gerar nome do arquivo
                const filename = `backup_${format(new Date(), "yyyyMMdd_HHmmss")}.sql${compression ? '.gz' : ''}`;
                
                // Simular tamanho do backup (aleatório entre 1MB e 100MB)
                const size = Math.floor(Math.random() * (100000000 - 1000000 + 1)) + 1000000;
                
                // Simular duração (entre 1 e 10 segundos)
                const duration = Math.floor(Math.random() * 9000) + 1000;

                // Preparar o valor de tables - USAR JSON.stringify
                const tablesValue = tables && tables.length > 0 
                    ? JSON.stringify(tables) 
                    : JSON.stringify([]); // Sempre string JSON válida


                // Criar registro do backup no banco
                const backup = await prisma.backups.create({
                    data: {
                        name,
                        filename,
                        size: BigInt(size),
                        type: "manual",
                        status: "completed",
                        completed_at: new Date(),
                        tables: tablesValue, // <-- AGORA É STRING JSON
                        records_count: Math.floor(Math.random() * 10000) + 1000,
                        location: `/backups/${filename}`,
                        checksum: encryption ? `sha256:${Math.random().toString(36).substring(2)}` : null,
                        compression_ratio: compression ? (Math.random() * 0.5) + 0.3 : null,
                        duration: duration,
                        created_by: userId || user,
                    },
                });

                const duration_total = Date.now() - startTime;

                // Log da operação
                try {
                    await prisma.logs.create({
                        data: {
                            level: "SUCCESS",
                            action: "Criar Backup",
                            user,
                            user_id: userId,
                            details: `Backup manual criado: ${name} - Tamanho: ${formatBytes(size)}`,
                            ip: req.ip,
                            resource: "backups",
                            resource_id: backup.id,
                            duration: duration_total,
                        },
                    });
                } catch (logError) {
                    console.error("Erro ao criar log:", logError);
                }

                // Na resposta, converter de volta para array
                const backupResponse = {
                    ...backup,
                    size: Number(backup.size),
                    tables: backup.tables ? JSON.parse(backup.tables) : []
                };

                return reply.status(201).send(backupResponse);

            } catch (error: any) {
                const duration = Date.now() - startTime;

                // Log de erro
                try {
                    await prisma.logs.create({
                        data: {
                            level: "ERROR",
                            action: "Criar Backup",
                            user,
                            user_id: userId,
                            details: `Erro ao criar backup: ${error.message}`,
                            ip: req.ip,
                            resource: "backups",
                            duration,
                        },
                    });
                } catch (logError) {
                    console.error("Erro ao criar log de erro:", logError);
                }

                console.error("Erro detalhado ao criar backup:", error);
                return reply.status(500).send({ 
                    error: "Erro ao criar backup",
                    message: error.message 
                });
            }
        }
    );
};

// Função auxiliar para formatar bytes
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}