"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUser = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const DeleteUser = async (app) => {
    app.withTypeProvider().delete("/user/delete/:id_user", {
        schema: {
            params: zod_1.z.object({
                id_user: zod_1.z.string().nonempty("O campo id é obrigatório."),
            }),
        },
    }, async (req, reply) => {
        const { id_user } = req.params;
        const user = await prismaclient_1.prisma.users.findUnique({
            where: {
                id_user,
            },
        });
        if (!user) {
            return reply.status(404).send({ message: "Usuário não encontrado" });
        }
        await prismaclient_1.prisma.users.delete({
            where: {
                id_user,
            },
        });
        return reply.status(200).send({ message: "Usuário eliminado com sucesso!" });
    });
};
exports.DeleteUser = DeleteUser;
