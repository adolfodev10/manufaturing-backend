"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const prismaclient_1 = require("../../../lib/prismaclient");
const serializeValue = (value) => {
    if (value === undefined || value === null) {
        return null;
    }
    return typeof value === "string" ? value : JSON.stringify(value);
};
exports.logger = {
    async info(data) {
        return this.log({ ...data, level: "INFO" });
    },
    async warning(data) {
        return this.log({ ...data, level: "WARNING" });
    },
    async error(data) {
        return this.log({ ...data, level: "ERROR" });
    },
    async success(data) {
        return this.log({ ...data, level: "SUCCESS" });
    },
    async log(data) {
        try {
            await prismaclient_1.prisma.logs.create({
                data: {
                    level: data.level,
                    action: data.action,
                    user: data.user,
                    user_id: data.user_id,
                    details: data.details,
                    ip: data.ip || null,
                    resource: data.resource,
                    resource_id: data.resource_id,
                    old_value: serializeValue(data.old_value),
                    new_value: serializeValue(data.new_value),
                    duration: data.duration || null,
                },
            });
        }
        catch (error) {
            console.error("Erro ao criar log:", error);
        }
    },
    logSync(data) {
        void this.log(data);
    },
};
