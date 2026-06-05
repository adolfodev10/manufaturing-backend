"use strict";
// src/services/logService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLog = createLog;
const prismaclient_1 = require("../../lib/prismaclient");
async function createLog(data) {
    try {
        const log = await prismaclient_1.prisma.logs.create({
            data: {
                level: data.level,
                action: data.action,
                user: data.user,
                user_id: data.user_id,
                details: data.details,
                ip: data.ip || "0.0.0.0",
                resource: data.resource,
                resource_id: data.resource_id,
                old_value: data.old_value,
                new_value: data.new_value,
                duration: data.duration,
            },
        });
        return log;
    }
    catch (error) {
        console.error("Erro ao criar log:", error);
        return null;
    }
}
