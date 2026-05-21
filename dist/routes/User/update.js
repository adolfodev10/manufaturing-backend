"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUser = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const UpdateUser = async (app) => {
    app.withTypeProvider().put('/user/edit/:id', {
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            body: zod_1.z.object({
                name: zod_1.z.string(),
                email: zod_1.z.string(),
                born: zod_1.z.string().optional(),
                phone_number: zod_1.z.string(),
                avatar: zod_1.z.string().optional(),
                user_status: zod_1.z.string(),
                role: zod_1.z.enum(["ADMINISTRADOR", "OPERADOR", "GERENTE"]),
            })
        },
    }, async (req, res) => {
        const { id } = req.params;
        const { name, email, born, phone_number, avatar, user_status, role } = req.body;
        if (!id) {
            return res.status(400).send({ message: "O campo id é obrigatório" });
        }
        const existingUser = await prismaclient_1.prisma.users.findUnique({
            where: {
                id_user: id,
            },
        });
        if (!existingUser) {
            return res.status(404).send({ message: "Usuário não encontrado" });
        }
        try {
            const user = await prismaclient_1.prisma.users.update({
                where: {
                    id_user: id,
                },
                data: {
                    name,
                    email,
                    born: born ? new Date(born) : existingUser.born,
                    phone_number,
                    avatar,
                    user_status: user_status,
                    role,
                },
            });
            return res.status(200).send({
                message: "Usuário atualizado com sucesso",
                user,
            });
        }
        catch (error) {
            return res.status(500).send({ message: "Erro ao atualizar o usuário", error });
        }
    });
};
exports.UpdateUser = UpdateUser;
