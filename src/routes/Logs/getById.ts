import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const GetLogById = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/logs/:id", {
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

            return reply.status(200).send(log);
        }
    );
};