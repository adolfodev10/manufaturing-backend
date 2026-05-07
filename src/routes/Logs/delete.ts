import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const DeleteLog = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/logs/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    },
        async (req, reply) => {
            const { id } = req.params;

            const log = await prisma.logs.findUnique({
                where: { id },
            });

            if (!log) {
                return reply.status(404).send({ message: "Log não encontrado" });
            }

            await prisma.logs.delete({
                where: { id },
            });

            return reply.status(200).send({ message: "Log removido com sucesso" });
        }
    );
};