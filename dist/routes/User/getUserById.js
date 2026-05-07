"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserById = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const GetUserById = async (app) => {
    app.withTypeProvider().get('/user/:userId', {
        schema: {
            params: zod_1.z.object({
                userId: zod_1.z.string(),
            })
        }
    }, async (request, reply) => {
        const { userId } = request.params;
        const user = await prismaclient_1.prisma.users.findUnique({
            where: {
                id_user: userId,
                user_status: "ACTIVO",
            },
        });
        if (user?.user_status === "INATIVO") {
            throw new Error("User is Inactive");
        }
        if (!user) {
            throw new Error("User not found");
        }
        return reply.status(200).send(user);
    });
};
exports.GetUserById = GetUserById;
