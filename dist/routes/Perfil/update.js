"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtualizarPerfil = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const AtualizarPerfil = async (app) => {
    app.withTypeProvider().put("/perfis/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
            body: zod_1.default.object({
                nome: zod_1.default.string().min(3).optional(),
                descricao: zod_1.default.string().min(5).optional(),
                nivel: zod_1.default.number().int().min(1).max(5).optional(),
                permissoes: zod_1.default.array(zod_1.default.string().uuid()).optional(),
                is_default: zod_1.default.boolean().optional(),
            }).refine(data => Object.keys(data).length > 0, {
                message: "Pelo menos um campo deve ser fornecido para atualização"
            }),
        },
    }, async (req, reply) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            // Verificar se o perfil existe
            const perfilExistente = await prismaclient_1.prisma.perfil.findUnique({
                where: { id },
            });
            if (!perfilExistente) {
                return reply.status(404).send({ error: "Perfil não encontrado" });
            }
            // Verificar se é um perfil do sistema (não pode ser alterado)
            if (perfilExistente.is_system) {
                return reply.status(403).send({ error: "Perfil do sistema não pode ser alterado" });
            }
            // Verificar se já existe outro perfil com o mesmo nome
            if (updateData.nome && updateData.nome !== perfilExistente.nome) {
                const perfilComMesmoNome = await prismaclient_1.prisma.perfil.findFirst({
                    where: {
                        nome: updateData.nome,
                        NOT: { id }
                    },
                });
                if (perfilComMesmoNome) {
                    return reply.status(400).send({ error: "Já existe um perfil com este nome" });
                }
            }
            // Se for perfil padrão, remover padrão de outros perfis
            if (updateData.is_default) {
                await prismaclient_1.prisma.perfil.updateMany({
                    where: {
                        is_default: true,
                        NOT: { id }
                    },
                    data: { is_default: false },
                });
            }
            // Preparar dados para atualização
            const dataToUpdate = { ...updateData };
            if (updateData.permissoes) {
                dataToUpdate.permissoes = JSON.stringify(updateData.permissoes);
            }
            const perfilAtualizado = await prismaclient_1.prisma.perfil.update({
                where: { id },
                data: dataToUpdate,
            });
            return reply.status(200).send({
                ...perfilAtualizado,
                permissoes: JSON.parse(perfilAtualizado.permissoes)
            });
        }
        catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            return reply.status(500).send({ error: "Erro ao atualizar perfil" });
        }
    });
};
exports.AtualizarPerfil = AtualizarPerfil;
