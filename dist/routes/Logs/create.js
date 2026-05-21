"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLog = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const CreateLog = async (app) => {
    app.withTypeProvider().post("/logs/create", {
        schema: {
            body: zod_1.default.object({
                level: zod_1.default.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]),
                action: zod_1.default.string(),
                user: zod_1.default.string(),
                user_id: zod_1.default.string().optional(),
                details: zod_1.default.string(),
                ip: zod_1.default.string().optional(),
                resource: zod_1.default.string(),
                resource_id: zod_1.default.string().optional(),
                old_value: zod_1.default.any().optional(),
                new_value: zod_1.default.any().optional(),
                duration: zod_1.default.number().optional(),
            }),
        },
    }, async (req, reply) => {
        const { level, action, user, user_id, details, ip, resource, resource_id, old_value, new_value, duration } = req.body;
        const log = await prismaclient_1.prisma.logs.create({
            data: {
                level,
                action,
                user,
                user_id,
                details,
                ip,
                resource,
                resource_id,
                old_value: old_value || undefined,
                new_value: new_value || undefined,
                duration,
            },
        });
        return reply.status(201).send(log);
    });
};
exports.CreateLog = CreateLog;
