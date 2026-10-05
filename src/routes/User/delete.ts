import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const DeleteUser = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete(
        "/user/delete/:id_user",
        {
            schema: {
                params: z.object({
                    id_user: z.string().nonempty("O campo id_user é obrigatório."),
                }),
            },
        },
        async (req, reply) => {
            const startTime = Date.now();
            const { id_user } = req.params;
            const ip = req.ip || req.socket.remoteAddress || "unknown";

            const requester = (req as any).user as
                | { id_user?: string; role?: string }
                | undefined;

            if (!requester?.id_user) {
                await logger.warning({
                    action: "Eliminar Usuário",
                    user: "desconhecido",
                    details: "Pedido sem autenticação válida",
                    ip,
                    resource: "user",
                    resource_id: id_user,
                    duration: Date.now() - startTime,
                });
                return reply.status(401).send({ message: "Não autenticado." });
            }

            if (requester.role !== "ADMINISTRADOR") {
                await logger.warning({
                    action: "Eliminar Usuário",
                    user: requester.id_user,
                    details: "Tentativa de eliminação sem permissão de administrador",
                    ip,
                    resource: "user",
                    resource_id: id_user,
                    duration: Date.now() - startTime,
                });
                return reply
                    .status(403)
                    .send({ message: "Apenas administradores podem eliminar usuários." });
            }

            if (requester.id_user === id_user) {
                await logger.warning({
                    action: "Eliminar Usuário",
                    user: requester.id_user,
                    details: "Tentativa de auto-eliminação bloqueada",
                    ip,
                    resource: "user",
                    resource_id: id_user,
                    duration: Date.now() - startTime,
                });
                return reply
                    .status(403)
                    .send({ message: "Não pode eliminar a sua própria conta." });
            }

            const user = await prisma.users.findUnique({ where: { id_user } });

            if (!user) {
                await logger.warning({
                    action: "Eliminar Usuário",
                    user: requester.id_user,
                    details: "Tentativa de apagar usuário inexistente",
                    ip,
                    resource: "user",
                    resource_id: id_user,
                    duration: Date.now() - startTime,
                });
                return reply.status(404).send({ message: "Usuário não encontrado." });
            }

            if (user.role === "ADMINISTRADOR") {
                const activeAdmins = await prisma.users.count({
                    where: { role: "ADMINISTRADOR", user_status: "ACTIVO" },
                });

                if (activeAdmins <= 1) {
                    await logger.warning({
                        action: "Eliminar Usuário",
                        user: requester.id_user,
                        details:
                            "Tentativa de eliminar o último administrador ativo bloqueada",
                        ip,
                        resource: "user",
                        resource_id: id_user,
                        duration: Date.now() - startTime,
                    });
                    return reply.status(403).send({
                        message:
                            "Não é possível eliminar o último administrador ativo do sistema.",
                    });
                }
            }

            try {
                await prisma.users.delete({ where: { id_user } });
            } catch (error: any) {
                const duration = Date.now() - startTime;

                if (error?.code === "P2003") {
                    await logger.warning({
                        action: "Eliminar Usuário",
                        user: requester.id_user,
                        details: `FK constraint ao eliminar ${user.email}`,
                        ip,
                        resource: "user",
                        resource_id: id_user,
                        duration,
                    });
                    return reply.status(409).send({
                        message:
                            "Este usuário tem registos associados (vendas, produções, etc.). Desative-o em vez de eliminar.",
                    });
                }

                if (error?.code === "P2025") {
                    await logger.warning({
                        action: "Eliminar Usuário",
                        user: requester.id_user,
                        details: "Usuário já não existe (race condition)",
                        ip,
                        resource: "user",
                        resource_id: id_user,
                        duration,
                    });
                    return reply.status(404).send({ message: "Usuário não encontrado." });
                }

                await logger.error({
                    action: "Eliminar Usuário",
                    user: requester.id_user,
                    details: `Erro inesperado: ${error?.message ?? "desconhecido"}`,
                    ip,
                    resource: "user",
                    resource_id: id_user,
                    duration,
                });
                return reply
                    .status(500)
                    .send({ message: "Erro interno ao eliminar usuário." });
            }

            const duration = Date.now() - startTime;
            await logger.success({
                action: "Eliminar Usuário",
                user: requester.id_user,
                details: `Usuário ${user.name} (${user.email}) eliminado`,
                ip,
                resource: "user",
                resource_id: id_user,
                duration,
            });

            return reply
                .status(200)
                .send({ message: "Usuário eliminado com sucesso!" });
        },
    );
};