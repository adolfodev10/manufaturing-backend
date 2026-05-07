"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationToken = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const verifyToken_1 = require("../../modules/services/jwt/verifyToken");
const ValidationToken = async (app) => {
    app.withTypeProvider().post('/auth/validateToken', {
        schema: {
            body: zod_1.default.object({
                token: zod_1.default.string(),
            })
        }
    }, async (request, reply) => {
        const { token } = request.body;
        if (!token) {
            reply.status(400).send({ error: 'Token not provided' });
            return;
        }
        const decodedToken = await (0, verifyToken_1.verifyToken)(token);
        if (!decodedToken) {
            reply.status(401).send({ error: 'Invalid token' });
            return;
        }
        const findUser = await prismaclient_1.prisma.users.findUnique({
            where: {
                id_user: decodedToken.id_user
            }
        });
        if (!findUser) {
            reply.status(400).send({ error: 'User not found' });
            return;
        }
        const userWithoutPassword = {
            id_user: findUser.id_user,
            name: findUser.name,
            email: findUser.email,
            phone_number: findUser.phone_number,
            avatar: findUser.avatar,
            born: findUser.born,
            id_funcao: findUser.funcao_id
        };
        reply.status(200).send({ message: 'Token is valid', user: userWithoutPassword });
    });
};
exports.ValidationToken = ValidationToken;
