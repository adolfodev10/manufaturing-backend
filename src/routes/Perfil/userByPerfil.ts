import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const ListarUsuariosPorPerfil = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/perfis/:id/usuarios", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
            querystring: z.object({
                page: z.coerce.number().min(1).default(1).optional(),
                limit: z.coerce.number().min(1).max(100).default(10).optional(),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { id } = req.params;
                const { page = 1, limit = 10 } = req.query;

                const skip = (page - 1) * limit;

                // Verificar se perfil existe
                const perfil = await prisma.perfil.findUnique({
                    where: { id },
                });

                if (!perfil) {
                    return reply.status(404).send({ error: "Perfil não encontrado" });
                }

                // Buscar usuários com este perfil
                const [userPerfis, total] = await Promise.all([
                    prisma.userPerfil.findMany({
                        where: { perfil_id: id },
                        skip,
                        take: limit,
                        include: {
                            user: {
                                select: {
                                    id_user: true,
                                    name: true,
                                    email: true,
                                    avatar: true,
                                    user_status: true,
                                    role: true,
                                    created_at: true,
                                }
                            }
                        },
                        orderBy: {
                            user: {
                                name: 'asc'
                            }
                        }
                    }),
                    prisma.userPerfil.count({
                        where: { perfil_id: id }
                    })
                ]);

                const usuarios = userPerfis.map(up => up.user);

                return reply.status(200).send({
                    data: usuarios,
                    meta: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                });

            } catch (error) {
                console.error("Erro ao listar usuários do perfil:", error);
                return reply.status(500).send({ error: "Erro ao listar usuários do perfil" });
            }
        }
    );
};