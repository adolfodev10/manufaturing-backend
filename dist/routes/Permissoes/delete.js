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
            const permissaoExistente = await prismaclient_1.prisma.permissao.findUnique({
                where: { id },
            });
            if (!permissaoExistente) {
                return reply.status(404).send({ error: "Permissao nao encontrada" });
            }
            const perfis = await prismaclient_1.prisma.perfil.findMany({
                select: {
                    permissoes: true,
                },
            });
            const perfisComPermissao = perfis.filter((perfil) => {
                try {
                    const permissoes = JSON.parse(perfil.permissoes);
                    return Array.isArray(permissoes) && permissoes.includes(id);
                }
                catch {
                    return false;
                }
            }).length;
            if (perfisComPermissao > 0) {
                return reply.status(400).send({
                    error: "Nao e possivel excluir esta permissao pois ela esta associada a um ou mais perfis",
                    perfisCount: perfisComPermissao,
                });
            }
            await prismaclient_1.prisma.permissao.delete({
                where: { id },
            });
            return reply.status(204).send();
        }
        catch (error) {
            console.error("Erro ao deletar permissao:", error);
            return reply.status(500).send({ error: "Erro ao deletar permissao" });
        }
    });
};
exports.DeletarPermissao = DeletarPermissao;
