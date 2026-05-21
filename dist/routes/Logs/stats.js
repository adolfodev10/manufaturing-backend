"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLogsStats = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const GetLogsStats = async (app) => {
    app.withTypeProvider().get("/logs/stats", {
        schema: {
            querystring: zod_1.default.object({
                days: zod_1.default.string().optional().default("30"),
            }),
        },
    }, async (req, reply) => {
        const { days } = req.query;
        const daysNum = parseInt(days);
        const date = new Date();
        date.setDate(date.getDate() - daysNum);
        // Estatísticas gerais
        const [total, infoCount, warningCount, errorCount, successCount, recentActivity,] = await Promise.all([
            prismaclient_1.prisma.logs.count(),
            prismaclient_1.prisma.logs.count({ where: { level: "INFO" } }),
            prismaclient_1.prisma.logs.count({ where: { level: "WARNING" } }),
            prismaclient_1.prisma.logs.count({ where: { level: "ERROR" } }),
            prismaclient_1.prisma.logs.count({ where: { level: "SUCCESS" } }),
            prismaclient_1.prisma.logs.groupBy({
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
            const count = await prismaclient_1.prisma.logs.count({
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
    });
};
exports.GetLogsStats = GetLogsStats;
