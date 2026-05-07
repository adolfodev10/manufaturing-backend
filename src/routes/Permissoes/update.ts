import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const AtualizarPermissao = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put("/permissoes/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
            body: z.object({
                nome: z.string().optional(),
                descricao: z.string().optional(),
                modulo: z.string().optional(),
                acao: z.enum(["criar", "ler", "atualizar", "deletar", "exportar", "importar", "configurar"]).optional(),
                recurso: z.string().optional(),
            }).refine(data => Object.keys(data).length > 0, {
                message: "Pelo menos um campo deve ser fornecido para atualização"
            }),
        },
    },
        async (req, reply) => {
            try {
                const { id } = req.params;
                const updateData = req.body;

                // Verificar se a permissão existe
                const permissaoExistente = await prisma.permissao.findUnique({
                    where: { id },
                });

                if (!permissaoExistente) {
                    return reply.status(404).send({ error: "Permissão não encontrada" });
                }

                // Verificar se já existe outra permissão com o mesmo nome (se estiver atualizando o nome)
                if (updateData.nome && updateData.nome !== permissaoExistente.nome) {
                    const permissaoComMesmoNome = await prisma.permissao.findFirst({
                        where: { 
                            nome: updateData.nome,
                            NOT: { id }
                        },
                    });

                    if (permissaoComMesmoNome) {
                        return reply.status(400).send({ error: "Já existe uma permissão com este nome" });
                    }
                }

                const permissaoAtualizada = await prisma.permissao.update({
                    where: { id },
                    data: updateData,
                });

                return reply.status(200).send(permissaoAtualizada);

            } catch (error) {
                console.error("Erro ao atualizar permissão:", error);
                return reply.status(500).send({ error: "Erro ao atualizar permissão" });
            }
        }
    );
};