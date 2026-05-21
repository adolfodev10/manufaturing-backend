"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarUsuariosPorPerfil = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const ListarUsuariosPorPerfil = async (app) => {
    app.withTypeProvider().get("/perfis/:id/usuarios", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
            querystring: zod_1.default.object({
                page: zod_1.default.coerce.number().min(1).default(1).optional(),
                limit: zod_1.default.coerce.number().min(1).max(100).default(10).optional(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;
            // Verificar se perfil existe
            const perfil = await prismaclient_1.prisma.perfil.findUnique({
                where: { id },
            });
            if (!perfil) {
                return reply.status(404).send({ error: "Perfil não encontrado" });
            }
            // Buscar usuários com este perfil
            const [userPerfis, total] = await Promise.all([
                prismaclient_1.prisma.userPerfil.findMany({
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
                prismaclient_1.prisma.userPerfil.count({
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
        }
        catch (error) {
            console.error("Erro ao listar usuários do perfil:", error);
            return reply.status(500).send({ error: "Erro ao listar usuários do perfil" });
        }
    });
};
exports.ListarUsuariosPorPerfil = ListarUsuariosPorPerfil;
