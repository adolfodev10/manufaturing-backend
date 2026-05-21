"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLogs = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const GetLogs = async (app) => {
    app.withTypeProvider().get("/logs", {
        schema: {
            querystring: zod_1.default.object({
                level: zod_1.default.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]).optional(),
                user: zod_1.default.string().optional(),
                resource: zod_1.default.string().optional(),
                startDate: zod_1.default.string().optional(),
                endDate: zod_1.default.string().optional(),
                search: zod_1.default.string().optional(),
                page: zod_1.default.string().optional().default("1"),
                limit: zod_1.default.string().optional().default("50"),
            }),
        },
    }, async (req, reply) => {
        const { level, user, resource, startDate, endDate, search, page = "1", limit = "50" } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Construir filtros
        const where = {};
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
            prismaclient_1.prisma.logs.findMany({
                where,
                orderBy: {
                    timestamp: 'desc',
                },
                skip,
                take: limitNum,
            }),
            prismaclient_1.prisma.logs.count({ where }),
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
    });
};
exports.GetLogs = GetLogs;
