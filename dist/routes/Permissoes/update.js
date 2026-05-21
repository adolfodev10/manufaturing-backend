"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtualizarPermissao = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const AtualizarPermissao = async (app) => {
    app.withTypeProvider().put("/permissoes/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
            body: zod_1.default.object({
                nome: zod_1.default.string().optional(),
                descricao: zod_1.default.string().optional(),
                modulo: zod_1.default.string().optional(),
                acao: zod_1.default.enum(["criar", "ler", "atualizar", "deletar", "exportar", "importar", "configurar"]).optional(),
                recurso: zod_1.default.string().optional(),
            }).refine(data => Object.keys(data).length > 0, {
                message: "Pelo menos um campo deve ser fornecido para atualização"
            }),
        },
    }, async (req, reply) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            // Verificar se a permissão existe
            const permissaoExistente = await prismaclient_1.prisma.permissao.findUnique({
                where: { id },
            });
            if (!permissaoExistente) {
                return reply.status(404).send({ error: "Permissão não encontrada" });
            }
            // Verificar se já existe outra permissão com o mesmo nome (se estiver atualizando o nome)
            if (updateData.nome && updateData.nome !== permissaoExistente.nome) {
                const permissaoComMesmoNome = await prismaclient_1.prisma.permissao.findFirst({
                    where: {
                        nome: updateData.nome,
                        NOT: { id }
                    },
                });
                if (permissaoComMesmoNome) {
                    return reply.status(400).send({ error: "Já existe uma permissão com este nome" });
                }
            }
            const permissaoAtualizada = await prismaclient_1.prisma.permissao.update({
                where: { id },
                data: updateData,
            });
            return reply.status(200).send(permissaoAtualizada);
        }
        catch (error) {
            console.error("Erro ao atualizar permissão:", error);
            return reply.status(500).send({ error: "Erro ao atualizar permissão" });
        }
    });
};
exports.AtualizarPermissao = AtualizarPermissao;
