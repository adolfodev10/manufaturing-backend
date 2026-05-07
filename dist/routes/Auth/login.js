"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const verifyPassword_1 = require("../../modules/services/bcrypt/verifyPassword");
const generateToken_1 = require("../../modules/services/jwt/generateToken");
const Login = async (app) => {
    app.withTypeProvider().post('/auth/login', {
        schema: {
            body: zod_1.default.object({
                email: zod_1.default.string().email(),
                password: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { email, password } = request.body;
        const user = await prismaclient_1.prisma.users.findUnique({
            where: {
                email,
                user_status: "ACTIVO"
            },
        });
        if (!user) {
            reply.status(404).send({ error: 'User not found' });
            return;
        }
        const isPasswordValid = await (0, verifyPassword_1.verifyPassword)(password, user.senha);
        if (!isPasswordValid) {
            reply.status(401).send({ error: 'Credentials invalid' });
            return;
        }
        const token = await (0, generateToken_1.generateToken)({
            id_user: user.id_user,
            email: user.email
        });
        const userWithoutPassword = {
            id_user: user.id_user,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            born: user.born,
            id_funcao: user.funcao_id
        };
        return { user: userWithoutPassword, token };
    });
};
exports.Login = Login;
