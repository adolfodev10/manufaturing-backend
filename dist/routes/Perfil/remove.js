"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoverPerfilUsuario = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const RemoverPerfilUsuario = async (app) => {
    app.withTypeProvider().delete("/perfis/remover", {
        schema: {
            body: zod_1.default.object({
                usuario_id: zod_1.default.string().uuid(),
                perfil_id: zod_1.default.string().uuid(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { usuario_id, perfil_id } = req.body;
            // Verificar se a atribuição existe
            const userPerfil = await prismaclient_1.prisma.userPerfil.findUnique({
                where: {
                    user_id_perfil_id: {
                        user_id: usuario_id,
                        perfil_id: perfil_id,
                    }
                }
            });
            if (!userPerfil) {
                return reply.status(404).send({
                    error: "Atribuição não encontrada"
                });
            }
            // Verificar se o perfil é do sistema (não pode remover de último admin)
            const perfil = await prismaclient_1.prisma.perfil.findUnique({
                where: { id: perfil_id }
            });
            if (perfil?.is_system) {
                const countAdmins = await prismaclient_1.prisma.userPerfil.count({
                    where: { perfil_id }
                });
                if (countAdmins <= 1) {
                    return reply.status(403).send({
                        error: "Não é possível remover o último administrador do sistema"
                    });
                }
            }
            await prismaclient_1.prisma.userPerfil.delete({
                where: {
                    user_id_perfil_id: {
                        user_id: usuario_id,
                        perfil_id: perfil_id,
                    }
                }
            });
            // Atualizar contador de usuários no perfil
            const count = await prismaclient_1.prisma.userPerfil.count({
                where: { perfil_id }
            });
            await prismaclient_1.prisma.perfil.update({
                where: { id: perfil_id },
                data: { usuarios_count: count }
            });
            return reply.status(204).send();
        }
        catch (error) {
            console.error("Erro ao remover perfil:", error);
            return reply.status(500).send({ error: "Erro ao remover perfil" });
        }
    });
};
exports.RemoverPerfilUsuario = RemoverPerfilUsuario;
