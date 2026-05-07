import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const ListarPermissoes = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/permissoes", {
        schema: {
            querystring: z.object({
                page: z.coerce.number().min(1).default(1).optional(),
                limit: z.coerce.number().min(1).max(100).default(10).optional(),
                modulo: z.string().optional(),
                acao: z.enum(["criar", "ler", "atualizar", "deletar", "exportar", "importar", "configurar"]).optional(),
                search: z.string().optional(),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { page = 1, limit = 10, modulo, acao, search } = req.query;

                const skip = (page - 1) * limit;

                // Construir filtros
                const where: any = {};

                if (modulo) {
                    where.modulo = modulo;
                }

                if (acao) {
                    where.acao = acao;
                }

                if (search) {
                    where.OR = [
                        { nome: { contains: search, mode: 'insensitive' } },
                        { descricao: { contains: search, mode: 'insensitive' } },
                        { recurso: { contains: search, mode: 'insensitive' } },
                    ];
                }

                // Buscar permissões com paginação
                const [permissoes, total] = await Promise.all([
                    prisma.permissao.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy: { nome: 'asc' },
                    }),
                    prisma.permissao.count({ where }),
                ]);

                return reply.status(200).send({
                    data: permissoes,
                    meta: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                });

            } catch (error) {
                console.error("Erro ao listar permissões:", error);
                return reply.status(500).send({ error: "Erro ao listar permissões" });
            }
        }
    );
};