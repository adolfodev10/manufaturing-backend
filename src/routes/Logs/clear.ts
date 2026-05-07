import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const ClearLogs = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/logs/clear", {
        schema: {
            querystring: z.object({
                olderThan: z.string().optional(), // dias
                level: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]).optional(),
                resource: z.string().optional(),
            }),
        },
    },
        async (req, reply) => {
            const { olderThan, level, resource } = req.query;

            const where: any = {};

            if (olderThan) {
                const date = new Date();
                date.setDate(date.getDate() - parseInt(olderThan));
                where.timestamp = {
                    lt: date,
                };
            }

            if (level) {
                where.level = level;
            }

            if (resource) {
                where.resource = resource;
            }

            const { count } = await prisma.logs.deleteMany({
                where,
            });

            return reply.status(200).send({ 
                message: `${count} logs removidos com sucesso`,
                count 
            });
        }
    );
};