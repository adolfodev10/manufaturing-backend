"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuscarPerfilPorId = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const BuscarPerfilPorId = async (app) => {
    app.withTypeProvider().get("/perfis/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { id } = req.params;
            const perfil = await prismaclient_1.prisma.perfil.findUnique({
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
            const permissoesDetalhes = await prismaclient_1.prisma.permissao.findMany({
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
        }
        catch (error) {
            console.error("Erro ao buscar perfil:", error);
            return reply.status(500).send({ error: "Erro ao buscar perfil" });
        }
    });
};
exports.BuscarPerfilPorId = BuscarPerfilPorId;
