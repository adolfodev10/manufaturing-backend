import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const GetLogs = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/logs", {
        schema: {
            querystring: z.object({
                level: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]).optional(),
                user: z.string().optional(),
                resource: z.string().optional(),
                startDate: z.string().optional(),
                endDate: z.string().optional(),
                search: z.string().optional(),
                page: z.string().optional().default("1"),
                limit: z.string().optional().default("50"),
            }),
        },
    },
        async (req, reply) => {
            const { 
                level, 
                user, 
                resource, 
                startDate, 
                endDate, 
                search,
                page = "1",
                limit = "50"
            } = req.query;

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            // Construir filtros
            const where: any = {};

            if (level) {
                where.level = level;
            }

            if (user) {
                where.user = {
                    contains: user,
                    mode: 'insensitive',
                };
            }

            if (resource) {
                where.resource = {
                    contains: resource,
                    mode: 'insensitive',
                };
            }

            if (startDate || endDate) {
                where.timestamp = {};
                
                if (startDate) {
                    where.timestamp.gte = new Date(startDate);
                }
                
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    where.timestamp.lte = end;
                }
            }

            if (search) {
                where.OR = [
                    { action: { contains: search, mode: 'insensitive' } },
                    { details: { contains: search, mode: 'insensitive' } },
                    { user: { contains: search, mode: 'insensitive' } },
                ];
            }

            // Buscar logs com paginação
            const [logs, total] = await Promise.all([
                prisma.logs.findMany({
                    where,
                    orderBy: {
                        timestamp: 'desc',
                    },
                    skip,
                    take: limitNum,
                }),
                prisma.logs.count({ where }),
            ]);

            return reply.status(200).send({
                logs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        }
    );
};