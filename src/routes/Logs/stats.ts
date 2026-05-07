import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const GetLogsStats = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/logs/stats", {
        schema: {
            querystring: z.object({
                days: z.string().optional().default("30"),
            }),
        },
    },
        async (req, reply) => {
            const { days } = req.query;
            const daysNum = parseInt(days);

            const date = new Date();
            date.setDate(date.getDate() - daysNum);

            // Estatísticas gerais
            const [
                total,
                infoCount,
                warningCount,
                errorCount,
                successCount,
                recentActivity,
            ] = await Promise.all([
                prisma.logs.count(),
                prisma.logs.count({ where: { level: "INFO" } }),
                prisma.logs.count({ where: { level: "WARNING" } }),
                prisma.logs.count({ where: { level: "ERROR" } }),
                prisma.logs.count({ where: { level: "SUCCESS" } }),
                prisma.logs.groupBy({
                    by: ['level'],
                    where: {
                        timestamp: {
                            gte: date,
                        },
                    },
                    _count: true,
                }),
            ]);

            // Logs por dia (últimos 7 dias)
            const logsByDay = [];
            for (let i = 0; i < 7; i++) {
                const day = new Date();
                day.setDate(day.getDate() - i);
                day.setHours(0, 0, 0, 0);
                
                const nextDay = new Date(day);
                nextDay.setDate(nextDay.getDate() + 1);

                const count = await prisma.logs.count({
                    where: {
                        timestamp: {
                            gte: day,
                            lt: nextDay,
                        },
                    },
                });

                logsByDay.push({
                    date: day.toISOString().split('T')[0],
                    count,
                });
            }

            return reply.status(200).send({
                total,
                byLevel: {
                    INFO: infoCount,
                    WARNING: warningCount,
                    ERROR: errorCount,
                    SUCCESS: successCount,
                },
                recentActivity,
                logsByDay: logsByDay.reverse(),
            });
        }
    );
};