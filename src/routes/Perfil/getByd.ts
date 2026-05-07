import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const BuscarPerfilPorId = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/perfis/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { id } = req.params;

                const perfil = await prisma.perfil.findUnique({
                    where: { id },
                    include: {
                        users: {
                            select: {
                                user: {
                                    select: {
                                        id_user: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                        user_status: true,
                                    }
                                }
                            }
                        }
                    }
                });

                if (!perfil) {
                    return reply.status(404).send({ error: "Perfil não encontrado" });
                }

                // Buscar detalhes das permissões
                const permissoesIds = JSON.parse(perfil.permissoes);
                const permissoesDetalhes = await prisma.permissao.findMany({
                    where: {
                        id: {
                            in: permissoesIds
                        }
                    }
                });

                return reply.status(200).send({
                    ...perfil,
                    permissoes: permissoesDetalhes,
                    permissoes_ids: permissoesIds,
                    usuarios: perfil.users.map(u => u.user),
                });

            } catch (error) {
                console.error("Erro ao buscar perfil:", error);
                return reply.status(500).send({ error: "Erro ao buscar perfil" });
            }
        }
    );
};