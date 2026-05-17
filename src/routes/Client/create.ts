import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { ZodTypeProvider } from "fastify-type-provider-zod";

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
            const userId = (req as any).user?.id;

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

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Criar Cliente",
                    user,
                    user_id: userId,
                    details: `Cliente criado com sucesso. ` +
                             `Nome: "${client.name}" | ` +
                             `NIF: ${client.nif || 'Não informado'} | ` +
                             `Telefone: ${client.telefone || 'Não informado'} | ` +
                             `ID: ${client.id_client}`,
                    ip,
                    resource: "clients",
                    resource_id: client.id_client,
                    duration,
                });

                return reply.status(201).send(client);

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