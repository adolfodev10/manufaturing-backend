"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUser = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const DeleteUser = async (app) => {
    app.withTypeProvider().delete("/user/delete/:id_user", {
        schema: {
            params: zod_1.z.object({
                id_user: zod_1.z.string().nonempty("O campo id é obrigatório."),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id_user } = req.params;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = await prismaclient_1.prisma.users.findUnique({
            where: {
                id_user,
            },
        });
        if (!user) {
            const duration = Date.now() - startTime;
            await logger_1.logger.warning({
                action: "Eliminar Usuário",
                user: id_user,
                details: "Tentativa de apagar usuário inexistente",
                ip,
                resource: "user",
                resource_id: id_user,
                duration,
            });
            return reply.status(404).send({ message: "Usuário não encontrado" });
        }
        await prismaclient_1.prisma.users.delete({
            where: {
                id_user,
            },
        });
        const duration = Date.now() - startTime;
        await logger_1.logger.success({
            action: "Eliminar Usuários",
            user: user.email,
            details: `Usuário ${user.name} eliminado com sucesso`,
            ip,
            resource: "user",
            resource_id: id_user,
            duration,
        });
        return reply.status(200).send({ message: "Usuário eliminado com sucesso!" });
    });
};
exports.DeleteUser = DeleteUser;
