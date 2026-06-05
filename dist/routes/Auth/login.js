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
const logger_1 = require("../../modules/services/logs/logger");
const Login = async (app) => {
    app.withTypeProvider().post("/auth/login", {
        schema: {
            body: zod_1.default.object({
                email: zod_1.default.string().email(),
                password: zod_1.default.string(),
            }),
            params: zod_1.default.object({}),
        },
    }, async (request, reply) => {
        const startTime = Date.now();
        const { email, password } = request.body;
        const ip = request.ip || request.socket.remoteAddress || "unknown";
        try {
            const user = await prismaclient_1.prisma.users.findFirst({
                where: {
                    email,
                    user_status: "ACTIVO",
                },
            });
            if (!user) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Login",
                    user: email,
                    user_id: undefined,
                    details: "Tentativa de login - Email nao encontrado ou inativo",
                    ip,
                    resource: "auth",
                    duration,
                });
                return reply.status(401).send({ error: "Credenciais invalidas" });
            }
            const isValid = await (0, verifyPassword_1.comparePassword)(password, user.senha);
            if (!isValid) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Login",
                    user: email,
                    user_id: user.id_user,
                    details: "Tentativa de login - Senha invalida",
                    ip,
                    resource: "auth",
                    duration,
                });
                return reply.status(401).send({ error: "Credenciais invalidas" });
            }
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Login",
                user: email,
                user_id: user.id_user,
                details: `Login realizado com sucesso. Role: ${user.role}`,
                ip,
                resource: "auth",
                duration,
            });
            const token = await (0, generateToken_1.generateToken)({
                id_user: user.id_user,
                email: user.email,
            });
            const userWithoutPassword = {
                id_user: user.id_user,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                born: user.born,
                role: user.role,
            };
            return { user: userWithoutPassword, token };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Login",
                user: email,
                user_id: undefined,
                details: `Erro interno durante login: ${error.message}`,
                ip,
                resource: "auth",
                duration,
            });
            return reply.status(500).send({ error: "Erro interno do servidor" });
        }
    });
};
exports.Login = Login;
