import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const BuscarPermissaoPorId = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/permissoes/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { id } = req.params;

                const permissao = await prisma.permissao.findUnique({
                    where: { id },
                });

                if (!permissao) {
                    return reply.status(404).send({ error: "Permissão não encontrada" });
                }

                return reply.status(200).send(permissao);

            } catch (error) {
                console.error("Erro ao buscar permissão:", error);
                return reply.status(500).send({ error: "Erro ao buscar permissão" });
            }
        }
    );
};