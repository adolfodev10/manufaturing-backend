"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUser = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const GetUser = async (app) => {
    app.withTypeProvider().get('/user', {}, async (request, reply) => {
        const users = await prismaclient_1.prisma.users.findMany();
        return reply.status(200).send(users);
    });
};
exports.GetUser = GetUser;
