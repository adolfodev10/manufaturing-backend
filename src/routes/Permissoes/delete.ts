import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const DeletarPermissao = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/permissoes/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { id } = req.params;

                // Verificar se a permissão existe
                const permissaoExistente = await prisma.permissao.findUnique({
                    where: { id },
                });

                if (!permissaoExistente) {
                    return reply.status(404).send({ error: "Permissão não encontrada" });
                }

                // Verificar se a permissão está sendo usada por algum perfil/grupo
                const perfisComPermissao = await prisma.permissao.count({
                    where: {
                        id,
                    },
                });

                if (perfisComPermissao > 0) {
                    return reply.status(400).send({ 
                        error: "Não é possível excluir esta permissão pois ela está associada a um ou mais perfis",
                        perfisCount: perfisComPermissao
                    });
                }

                await prisma.permissao.delete({
                    where: { id },
                });

                return reply.status(204).send();

            } catch (error) {
                console.error("Erro ao deletar permissão:", error);
                return reply.status(500).send({ error: "Erro ao deletar permissão" });
            }
        }
    );
};