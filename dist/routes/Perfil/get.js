"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarPerfis = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const ListarPerfis = async (app) => {
    app.withTypeProvider().get("/perfis", {
        schema: {
            querystring: zod_1.default.object({
                page: zod_1.default.coerce.number().min(1).default(1).optional(),
                limit: zod_1.default.coerce.number().min(1).max(100).default(10).optional(),
                nivel: zod_1.default.coerce.number().min(1).max(5).optional(),
                search: zod_1.default.string().optional(),
                is_system: zod_1.default.coerce.boolean().optional(),
                is_default: zod_1.default.coerce.boolean().optional(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { page = 1, limit = 10, nivel, search, is_system, is_default } = req.query;
            const skip = (page - 1) * limit;
            // Construir filtros
            const where = {};
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
                prismaclient_1.prisma.perfil.findMany({
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
                prismaclient_1.prisma.perfil.count({ where }),
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
        }
        catch (error) {
            console.error("Erro ao listar perfis:", error);
            return reply.status(500).send({ error: "Erro ao listar perfis" });
        }
    });
};
exports.ListarPerfis = ListarPerfis;
