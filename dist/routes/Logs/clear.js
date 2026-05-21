"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearLogs = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const ClearLogs = async (app) => {
    app.withTypeProvider().delete("/logs/clear", {
        schema: {
            querystring: zod_1.default.object({
                olderThan: zod_1.default.string().optional(), // dias
                level: zod_1.default.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]).optional(),
                resource: zod_1.default.string().optional(),
            }),
        },
    }, async (req, reply) => {
        const { olderThan, level, resource } = req.query;
        const where = {};
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
        const { count } = await prismaclient_1.prisma.logs.deleteMany({
            where,
        });
        return reply.status(200).send({
            message: `${count} logs removidos com sucesso`,
            count
        });
    });
};
exports.ClearLogs = ClearLogs;
