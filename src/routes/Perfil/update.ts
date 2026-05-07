import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const AtualizarPerfil = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put("/perfis/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
            body: z.object({
                nome: z.string().min(3).optional(),
                descricao: z.string().min(5).optional(),
                nivel: z.number().int().min(1).max(5).optional(),
                permissoes: z.array(z.string().uuid()).optional(),
                is_default: z.boolean().optional(),
            }).refine(data => Object.keys(data).length > 0, {
                message: "Pelo menos um campo deve ser fornecido para atualização"
            }),
        },
    },
        async (req, reply) => {
            try {
                const { id } = req.params;
                const updateData = req.body;

                // Verificar se o perfil existe
                const perfilExistente = await prisma.perfil.findUnique({
                    where: { id },
                });

                if (!perfilExistente) {
                    return reply.status(404).send({ error: "Perfil não encontrado" });
                }

                // Verificar se é um perfil do sistema (não pode ser alterado)
                if (perfilExistente.is_system) {
                    return reply.status(403).send({ error: "Perfil do sistema não pode ser alterado" });
                }

                // Verificar se já existe outro perfil com o mesmo nome
                if (updateData.nome && updateData.nome !== perfilExistente.nome) {
                    const perfilComMesmoNome = await prisma.perfil.findFirst({
                        where: { 
                            nome: updateData.nome,
                            NOT: { id }
                        },
                    });

                    if (perfilComMesmoNome) {
                        return reply.status(400).send({ error: "Já existe um perfil com este nome" });
                    }
                }

                // Se for perfil padrão, remover padrão de outros perfis
                if (updateData.is_default) {
                    await prisma.perfil.updateMany({
                        where: { 
                            is_default: true,
                            NOT: { id }
                        },
                        data: { is_default: false },
                    });
                }

                // Preparar dados para atualização
                const dataToUpdate: any = { ...updateData };
                
                if (updateData.permissoes) {
                    dataToUpdate.permissoes = JSON.stringify(updateData.permissoes);
                }

                const perfilAtualizado = await prisma.perfil.update({
                    where: { id },
                    data: dataToUpdate,
                });

                return reply.status(200).send({
                    ...perfilAtualizado,
                    permissoes: JSON.parse(perfilAtualizado.permissoes)
                });

            } catch (error) {
                console.error("Erro ao atualizar perfil:", error);
                return reply.status(500).send({ error: "Erro ao atualizar perfil" });
            }
        }
    );
};