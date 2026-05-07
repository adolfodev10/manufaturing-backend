import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";

export const GetBackups = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/backups", {},
        async (req, reply) => {
            try {
                const backups = await prisma.backups.findMany({
                    orderBy: {
                        created_at: 'desc'
                    }
                });

                // Converter BigInt para Number
                const formattedBackups = backups.map(backup => ({
                    ...backup,
                    size: Number(backup.size)
                }));

                return reply.status(200).send(formattedBackups);
            } catch (error) {
                console.error("Erro ao buscar backups:", error);
                return reply.status(500).send({ error: "Erro ao buscar backups" });
            }
        }
    );
};