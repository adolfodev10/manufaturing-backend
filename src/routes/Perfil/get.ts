import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const ListarPerfis = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/perfis", {
        schema: {
            querystring: z.object({
                page: z.coerce.number().min(1).default(1).optional(),
                limit: z.coerce.number().min(1).max(100).default(10).optional(),
                nivel: z.coerce.number().min(1).max(5).optional(),
                search: z.string().optional(),
                is_system: z.coerce.boolean().optional(),
                is_default: z.coerce.boolean().optional(),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { page = 1, limit = 10, nivel, search, is_system, is_default } = req.query;

                const skip = (page - 1) * limit;

                // Construir filtros
                const where: any = {};

                if (nivel) {
                    where.nivel = nivel;
                }

                if (is_system !== undefined) {
                    where.is_system = is_system;
                }

                if (is_default !== undefined) {
                    where.is_default = is_default;
                }

                if (search) {
                    where.OR = [
                        { nome: { contains: search, mode: 'insensitive' } },
                        { descricao: { contains: search, mode: 'insensitive' } },
                    ];
                }

                // Buscar perfis com paginação
                const [perfis, total] = await Promise.all([
                    prisma.perfil.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy: [
                            { is_system: 'desc' },
                            { nivel: 'asc' },
                            { nome: 'asc' },
                        ],
                        include: {
                            users: {
                                select: {
                                    user: {
                                        select: {
                                            id_user: true,
                                            name: true,
                                            email: true,
                                        }
                                    }
                                }
                            }
                        }
                    }),
                    prisma.perfil.count({ where }),
                ]);

                // Formatar resposta
                const perfisFormatados = perfis.map(perfil => ({
                    ...perfil,
                    permissoes: JSON.parse(perfil.permissoes),
                    usuarios: perfil.users.map(u => u.user),
                    usuarios_count: perfil.usuarios_count,
                }));

                return reply.status(200).send({
                    data: perfisFormatados,
                    meta: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                });

            } catch (error) {
                console.error("Erro ao listar perfis:", error);
                return reply.status(500).send({ error: "Erro ao listar perfis" });
            }
        }
    );
};