"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteLog = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const DeleteLog = async (app) => {
    app.withTypeProvider().delete("/logs/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
        },
    }, async (req, reply) => {
        const { id } = req.params;
        const log = await prismaclient_1.prisma.logs.findUnique({
            where: { id },
        });
        if (!log) {
            return reply.status(404).send({ message: "Log não encontrado" });
        }
        await prismaclient_1.prisma.logs.delete({
            where: { id },
        });
        return reply.status(200).send({ message: "Log removido com sucesso" });
    });
};
exports.DeleteLog = DeleteLog;
