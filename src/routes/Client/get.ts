import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const GetClient = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/client/getAll", {},
        async (req, res) => {
            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const clients = await prisma.clients.findMany({
                    select: {
                        id_client: true,
                        name: true,
                        telefone: true,
                        nif: true,
                        created_at: true,
                        updated_at: true,
                       
                    },
                    orderBy: {
                        name: 'asc',
                    },
                });

                // Contar total de faturas por cliente
                const clientsWithStats = await Promise.all(
                    clients.map(async (client) => {
                        const totalFaturas = await prisma.dividas.count({
                            where: { client_id: client.id_client }
                        });


                        return {
                            id_client: client.id_client,
                            name: client.name,
                            telefone: client.telefone,
                            nif: client.nif,
                            criado_em: client.created_at,
                            atualizado_em: client.updated_at,
                            total_faturas: totalFaturas,
                        };
                    })
                );

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Clientes",
                    user,
                    user_id: userId,
                    details: `Listagem de clientes realizada. Total: ${clients.length} cliente(s)`,
                    ip,
                    resource: "clients",
                    duration,
                });

                return res.status(200).send(clientsWithStats);

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Listar Clientes",
                    user,
                    user_id: userId,
                    details: `Erro ao listar clientes: ${error.message}`,
                    ip,
                    resource: "clients",
                    duration,
                });

                console.error("Erro ao listar clientes:", error);

                return res.status(500).send({
                    error: "Erro ao listar clientes",
                    message: error.message
                });
            }
        });
};