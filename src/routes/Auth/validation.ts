import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { verifyToken } from "../../modules/services/jwt/verifyToken";
import { logger } from "../../modules/services/logs/logger";

export const ValidationToken = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/auth/validateToken', {
        schema: {
            body: z.object({
                token: z.string(),
            })
        }
    }, async (request, reply) => {
        const startTime = Date.now();
        const { token } = request.body;
        const ip = request.ip || request.socket.remoteAddress || "unknown";

        try {
            if (!token) {
                const duration = Date.now() - startTime;

                await logger.warning({
                    action: "Validar Token",
                    user: "desconhecido",
                    details: "Tentativa de validação sem token",
                    ip,
                    resource: "auth",
                    duration,
                });

                return reply.status(400).send({ error: 'Token não fornecido' });
            }

            const decodedToken = await verifyToken(token) as {
                id_user: string;
                email?: string;
            };

            if (!decodedToken) {
                const duration = Date.now() - startTime;

                await logger.warning({
                    action: "Validar Token",
                    user: "desconhecido",
                    details: "Tentativa de validação com token inválido ou expirado",
                    ip,
                    resource: "auth",
                    duration,
                });

                return reply.status(401).send({ error: 'Token inválido' });
            }

            const findUser = await prisma.users.findUnique({
                where: {
                    id_user: decodedToken.id_user
                }
            });

            if (!findUser) {
                const duration = Date.now() - startTime;

                await logger.warning({
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

            await logger.success({
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

        } catch (error: any) {
            const duration = Date.now() - startTime;

            await logger.error({
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