"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletarPermissao = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const DeletarPermissao = async (app) => {
    app.withTypeProvider().delete("/permissoes/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { id } = req.params;
            // Verificar se a permissão existe
            const permissaoExistente = await prismaclient_1.prisma.permissao.findUnique({
                where: { id },
            });
            if (!permissaoExistente) {
                return reply.status(404).send({ error: "Permissão não encontrada" });
            }
            // Verificar se a permissão está sendo usada por algum perfil/grupo
            const perfisComPermissao = await prismaclient_1.prisma.permissao.count({
                where: {
                    id,
                },
            });
            if (perfisComPermissao > 0) {
                return reply.status(400).send({
                    error: "Não é possível excluir esta permissão pois ela está associada a um ou mais perfis",
                    perfisCount: perfisComPermissao
                });
            }
            await prismaclient_1.prisma.permissao.delete({
                where: { id },
            });
            return reply.status(204).send();
        }
        catch (error) {
            console.error("Erro ao deletar permissão:", error);
            return reply.status(500).send({ error: "Erro ao deletar permissão" });
        }
    });
};
exports.DeletarPermissao = DeletarPermissao;
