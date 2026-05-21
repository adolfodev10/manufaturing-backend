"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarPermissoes = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const ListarPermissoes = async (app) => {
    app.withTypeProvider().get("/permissoes", {
        schema: {
            querystring: zod_1.default.object({
                page: zod_1.default.coerce.number().min(1).default(1).optional(),
                limit: zod_1.default.coerce.number().min(1).max(100).default(10).optional(),
                modulo: zod_1.default.string().optional(),
                acao: zod_1.default.enum(["criar", "ler", "atualizar", "deletar", "exportar", "importar", "configurar"]).optional(),
                search: zod_1.default.string().optional(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { page = 1, limit = 10, modulo, acao, search } = req.query;
            const skip = (page - 1) * limit;
            // Construir filtros
            const where = {};
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
                prismaclient_1.prisma.permissao.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { nome: 'asc' },
                }),
                prismaclient_1.prisma.permissao.count({ where }),
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
        }
        catch (error) {
            console.error("Erro ao listar permissões:", error);
            return reply.status(500).send({ error: "Erro ao listar permissões" });
        }
    });
};
exports.ListarPermissoes = ListarPermissoes;
