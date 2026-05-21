"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletarPerfil = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const DeletarPerfil = async (app) => {
    app.withTypeProvider().delete("/perfis/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { id } = req.params;
            // Verificar se o perfil existe
            const perfilExistente = await prismaclient_1.prisma.perfil.findUnique({
                where: { id },
                include: {
                    users: true
                }
            });
            if (!perfilExistente) {
                return reply.status(404).send({ error: "Perfil não encontrado" });
            }
            // Verificar se é um perfil do sistema (não pode ser deletado)
            if (perfilExistente.is_system) {
                return reply.status(403).send({ error: "Perfil do sistema não pode ser deletado" });
            }
            // Verificar se existem usuários associados
            if (perfilExistente.usuarios_count > 0 || perfilExistente.users.length > 0) {
                return reply.status(400).send({
                    error: "Não é possível excluir este perfil pois existem usuários associados",
                    usuarios_count: perfilExistente.usuarios_count,
                    usuarios: perfilExistente.users.map(u => u.user_id)
                });
            }
            await prismaclient_1.prisma.perfil.delete({
                where: { id },
            });
            return reply.status(204).send();
        }
        catch (error) {
            console.error("Erro ao deletar perfil:", error);
            return reply.status(500).send({ error: "Erro ao deletar perfil" });
        }
    });
};
exports.DeletarPerfil = DeletarPerfil;
