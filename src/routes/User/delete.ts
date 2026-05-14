import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const DeleteUser = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/user/delete/:id_user", {
        schema: {
            params: z.object({
                id_user: z.string().nonempty("O campo id é obrigatório."),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id_user } = req.params;
        const ip = req.ip || req.socket.remoteAddress || "unknown";

        const user = await prisma.users.findUnique({
            where: {
                id_user,
            },
        });

        if (!user) {
            const duration = Date.now() - startTime;

            await logger.warning({
                action: "Eliminar Usuário",
                user: id_user,
                details: "Tentativa de apagar usuário inexistente",
                ip,
                resource: "user",
                resource_id: id_user,
                duration,
            })
            return reply.status(404).send({ message: "Usuário não encontrado" });
        }

        await prisma.users.delete({
            where: {
                id_user,
            },
        });

        const duration = Date.now() - startTime;
        await logger.success({
            action: "Eliminar Usuários",
            user: user.email,
            details: `Usuário ${user.name} eliminado com sucesso`,
            ip,
            resource: "user",
            resource_id: id_user,
            duration,

        })

        return reply.status(200).send({ message: "Usuário eliminado com sucesso!" });
    })
}