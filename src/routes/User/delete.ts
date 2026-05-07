import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

export const DeleteUser = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/user/delete/:id_user", {
        schema: {
            params: z.object({
                id_user: z.string().nonempty("O campo id é obrigatório."),
            }),
        },
    }, async (req, reply) => {
        const { id_user } = req.params;

        const user = await prisma.users.findUnique({
            where: {
                id_user,
            },
        });

        if (!user) {
            return reply.status(404).send({ message: "Usuário não encontrado" });
        }

        await prisma.users.delete({
            where: {
                id_user,
            },
        });

        return reply.status(200).send({ message: "Usuário eliminado com sucesso!" });
    })
}