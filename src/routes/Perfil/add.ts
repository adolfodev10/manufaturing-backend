import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const AtribuirPerfilUsuario = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/perfis/atribuir", {
        schema: {
            body: z.object({
                atribuicoes: z.array(z.object({
                    usuario_id: z.string().uuid(),
                    perfil_id: z.string().uuid(),
                })),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { atribuicoes } = req.body;

                const results: Array<{ id: string; user_id: string; created_at: Date; perfil_id: string }> = [];

                for (const atribuicao of atribuicoes) {
                    // Verificar se usuário existe
                    const usuario = await prisma.users.findUnique({
                        where: { id_user: atribuicao.usuario_id }
                    });

                    if (!usuario) {
                        return reply.status(404).send({ 
                            error: `Usuário ${atribuicao.usuario_id} não encontrado` 
                        });
                    }

                    // Verificar se perfil existe
                    const perfil = await prisma.perfil.findUnique({
                        where: { id: atribuicao.perfil_id }
                    });

                    if (!perfil) {
                        return reply.status(404).send({ 
                            error: `Perfil ${atribuicao.perfil_id} não encontrado` 
                        });
                    }

                    // Criar ou atualizar atribuição
                    const userPerfil = await prisma.userPerfil.upsert({
                        where: {
                            user_id_perfil_id: {
                                user_id: atribuicao.usuario_id,
                                perfil_id: atribuicao.perfil_id,
                            }
                        },
                        update: {},
                        create: {
                            user_id: atribuicao.usuario_id,
                            perfil_id: atribuicao.perfil_id,
                        },
                    });

                    results.push(userPerfil);
                }

                // Atualizar contadores de usuários nos perfis
                for (const atribuicao of atribuicoes) {
                    const count = await prisma.userPerfil.count({
                        where: { perfil_id: atribuicao.perfil_id }
                    });

                    await prisma.perfil.update({
                        where: { id: atribuicao.perfil_id },
                        data: { usuarios_count: count }
                    });
                }

                return reply.status(201).send({
                    message: "Perfis atribuídos com sucesso",
                    count: results.length
                });

            } catch (error) {
                console.error("Erro ao atribuir perfis:", error);
                return reply.status(500).send({ error: "Erro ao atribuir perfis" });
            }
        }
    );
};