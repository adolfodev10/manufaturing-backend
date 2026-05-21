"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationToken = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const verifyToken_1 = require("../../modules/services/jwt/verifyToken");
const logger_1 = require("../../modules/services/logs/logger");
const ValidationToken = async (app) => {
    app.withTypeProvider().post('/auth/validateToken', {
        schema: {
            body: zod_1.default.object({
                token: zod_1.default.string(),
            })
        }
    }, async (request, reply) => {
        const startTime = Date.now();
        const { token } = request.body;
        const ip = request.ip || request.socket.remoteAddress || "unknown";
        try {
            if (!token) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Validar Token",
                    user: "desconhecido",
                    details: "Tentativa de validação sem token",
                    ip,
                    resource: "auth",
                    duration,
                });
                return reply.status(400).send({ error: 'Token não fornecido' });
            }
            const decodedToken = await (0, verifyToken_1.verifyToken)(token);
            if (!decodedToken) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Validar Token",
                    user: "desconhecido",
                    details: "Tentativa de validação com token inválido ou expirado",
                    ip,
                    resource: "auth",
                    duration,
                });
                return reply.status(401).send({ error: 'Token inválido' });
            }
            const findUser = await prismaclient_1.prisma.users.findUnique({
                where: {
                    id_user: decodedToken.id_user
                }
            });
            if (!findUser) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Validar Token",
                    user: decodedToken.email || decodedToken.id_user,
                    details: "Token válido mas usuário não encontrado na base de dados",
                    ip,
                    resource: "auth",
                    duration,
                });
                return reply.status(400).send({ error: 'Usuário não encontrado' });
            }
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Validar Token",
                user: findUser.email,
                user_id: findUser.id_user,
                details: `Token validado com sucesso. Role: ${findUser.role}`,
                ip,
                resource: "auth",
                duration,
            });
            const userWithoutPassword = {
                id_user: findUser.id_user,
                name: findUser.name,
                email: findUser.email,
                phone_number: findUser.phone_number,
                avatar: findUser.avatar,
                born: findUser.born,
                role: findUser.role
            };
            return reply.status(200).send({
                message: 'Token válido',
                user: userWithoutPassword
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Validar Token",
                user: "desconhecido",
                details: `Erro interno na validação de token: ${error.message}`,
                ip,
                resource: "auth",
                duration,
            });
            return reply.status(500).send({ error: 'Erro interno do servidor' });
        }
    });
};
exports.ValidationToken = ValidationToken;
