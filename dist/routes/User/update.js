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
                phone_number: zod_1.z.string(),
                avatar: zod_1.z.string().optional(),
                user_status: zod_1.z.string(),
                funcao_id: zod_1.z.string(),
            })
        },
    }, async (req, res) => {
        const { id } = req.params;
        const { name, email, phone_number, avatar, user_status, funcao_id } = req.body;
        if (!id) {
            return res.status(400).send({ message: "O campo id é obrigatório" });
        }
        const existingUser = await prismaclient_1.prisma.users.findUnique({
            where: {
                id_user: id,
            },
        });
        if (!existingUser) {
            return res.status(404).send({ message: "User not found" });
        }
        const user = await prismaclient_1.prisma.users.update({
            where: {
                id_user: id,
            },
            data: {
                name,
                email,
                phone_number,
                avatar,
                user_status: user_status,
                funcao_id,
            },
        });
        return res.status(200).send({
            message: "User updated successfully",
            user,
        });
    });
};
exports.UpdateUser = UpdateUser;
