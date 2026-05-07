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
            const userId = (req as any).user?.id;

            try {
                const client = await prisma.clients.create({
                    data: {
                        name,
                        telefone: telefone || "",
                        nif: nif || "",
                        created_at: new Date(), // Campo obrigatório
                        updated_at: new Date(), // Campo obrigatório
                        id_client: randomUUID(), 
                    },
                });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Criar Cliente",
                    user,
                    user_id: userId,
                    details: `Cliente ${client.name} criado com sucesso. ID: ${client.id_client}`,
                    ip,
                    resource: "clients",
                    resource_id: client.id_client,
                    duration,
                });

                return reply.status(201).send(client);
            } catch (error) {
                const duration = Date.now() - startTime;
                await logger.error({
                    action: "Criar Cliente",
                    user,
                    user_id: userId,
                    details: `Erro ao criar cliente: ${(error as Error).message}`,
                    ip,
                    resource: "clients",
                    duration,
                });
                return reply.status(500).send({ message: "Erro ao criar cliente" });
            }
        }
    );
};