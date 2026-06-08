import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { randomUUID } from "crypto";

export const CreateClient = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/client/create", {
        schema: {
            body: z.object({
                name: z.string().min(1, "Nome é obrigatório"),
                telefone: z.string().optional(),
                nif: z.string().optional(),
            }),
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { name, telefone, nif } = req.body;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id_user;

            try {
                // Verificar se já existe cliente com mesmo NIF (se fornecido)
                if (nif) {
                    const existingClient = await prisma.clients.findFirst({
                        where: { nif }
                    });

                    if (existingClient) {
                        const duration = Date.now() - startTime;

                        await logger.warning({
                            action: "Criar Cliente",
                            user,
                            user_id: userId,
                            details: `Tentativa de criar cliente com NIF duplicado: ${nif}`,
                            ip,
                            resource: "clients",
                            duration,
                        });

                        return reply.status(409).send({
                            message: "Já existe um cliente com este NIF"
                        });
                    }
                }

                const client = await prisma.clients.create({
                    data: {
                        name,
                        telefone: telefone || "",
                        nif: nif || "",
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                });

                console.log("🧶🧶🧶Cliente: ", client);

                let usersToNotify: string[] = [];

                if (userId) {

                    const admins = await prisma.users.findMany({
                        where: { 
                            role: {in :  ["ADMINISTRADOR", "GERENTE"] },
                            user_status:"ACTIVO"
                         },
                        select: { id_user: true }
                    });
                    usersToNotify = admins.map(u => u.id_user);
                }

                if(usersToNotify.length === 0) {
                    const anyAdmin = await prisma.users.findFirst({
                        where: { role: { in: ["ADMINISTRADOR", "GERENTE"] },
                                user_status:"ACTIVO"
                    },
                        select: { id_user: true }
                    });
                    if(anyAdmin) {
                        usersToNotify = [anyAdmin.id_user];
                    }else {
                        let systemUser = await prisma.users.findFirst({
                            where: { email: "sistema@exemplo.com" },
                        });

                        if (!systemUser) {
                            systemUser = await prisma.users.create({
                                data: {
                                    name: "Sistema",
                                    email: "sistema@exemplo.com",
                                    senha: randomUUID(),
                                    born: new Date(),
                                    role: "ADMINISTRADOR",
                                    user_status: "ACTIVO",
                                }
                            });
                        }
                        usersToNotify = [systemUser.id_user];
                    }
                    }

              const notifications =  await Promise.all(
                    usersToNotify.map(userId =>  
                        prisma.notification.create({
                            data: { 
                                user_id: userId,
                        message: `Novo cliente criado: ${client.name}`,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }
                })
            )
        );

                console.log("🍀🍀🍀 Notificações enviadas: ", notifications.length)

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Criar Cliente",
                    user,
                    user_id: userId,
                    details: `Cliente criado com sucesso. ` +
                        `Nome: "${client.name}" | ` +
                        `NIF: ${client.nif || 'Não informado'} | ` +
                        `Telefone: ${client.telefone || 'Não informado'} | ` +
                        `ID: ${client.id_client}` +
                        `Notificações: ${notifications.length}`,
                    ip,
                    resource: "clients",
                    resource_id: client.id_client,
                    duration,
                });

                return reply.status(201).send({
                    ...client,
                    notifications_sent: notifications.length
                });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Criar Cliente",
                    user,
                    user_id: userId,
                    details: `Erro ao criar cliente "${name}": ${error.message}`,
                    ip,
                    resource: "clients",
                    duration,
                });

                console.error("Erro ao criar cliente:", error);

                return reply.status(500).send({
                    message: "Erro ao criar cliente",
                    error: error.message
                });
            }
        }
    );
};