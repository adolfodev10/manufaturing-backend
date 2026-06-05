"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserByFuncao = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const GetUserByFuncao = async (app) => {
    app.withTypeProvider().get("/user/getUserByRole", {
        schema: {
            querystring: zod_1.z.object({
                role: zod_1.z.enum(["ADMINISTRADOR", "OPERADOR", "GERENTE"]),
            }),
        },
    }, async (req) => {
        const { role } = req.query;
        const roles = await prismaclient_1.prisma.users.findMany({
            where: {
                role,
            },
        });
        return roles;
    });
};
exports.GetUserByFuncao = GetUserByFuncao;
