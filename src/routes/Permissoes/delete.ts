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

                const permissaoExistente = await prisma.permissao.findUnique({
                    where: { id },
                });

                if (!permissaoExistente) {
                    return reply.status(404).send({ error: "Permissao nao encontrada" });
                }

                const perfis = await prisma.perfil.findMany({
                    select: {
                        permissoes: true,
                    },
                });

                const perfisComPermissao = perfis.filter((perfil) => {
                    try {
                        const permissoes = JSON.parse(perfil.permissoes);
                        return Array.isArray(permissoes) && permissoes.includes(id);
                    } catch {
                        return false;
                    }
                }).length;

                if (perfisComPermissao > 0) {
                    return reply.status(400).send({
                        error: "Nao e possivel excluir esta permissao pois ela esta associada a um ou mais perfis",
                        perfisCount: perfisComPermissao,
                    });
                }

                await prisma.permissao.delete({
                    where: { id },
                });

                return reply.status(204).send();

            } catch (error) {
                console.error("Erro ao deletar permissao:", error);
                return reply.status(500).send({ error: "Erro ao deletar permissao" });
            }
        }
    );
};
