"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtribuirPerfilUsuario = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const AtribuirPerfilUsuario = async (app) => {
    app.withTypeProvider().post("/perfis/atribuir", {
        schema: {
            body: zod_1.default.object({
                atribuicoes: zod_1.default.array(zod_1.default.object({
                    usuario_id: zod_1.default.string().uuid(),
                    perfil_id: zod_1.default.string().uuid(),
                })),
            }),
        },
    }, async (req, reply) => {
        try {
            const { atribuicoes } = req.body;
            const results = [];
            for (const atribuicao of atribuicoes) {
                // Verificar se usuário existe
                const usuario = await prismaclient_1.prisma.users.findUnique({
                    where: { id_user: atribuicao.usuario_id }
                });
                if (!usuario) {
                    return reply.status(404).send({
                        error: `Usuário ${atribuicao.usuario_id} não encontrado`
                    });
                }
                // Verificar se perfil existe
                const perfil = await prismaclient_1.prisma.perfil.findUnique({
                    where: { id: atribuicao.perfil_id }
                });
                if (!perfil) {
                    return reply.status(404).send({
                        error: `Perfil ${atribuicao.perfil_id} não encontrado`
                    });
                }
                // Criar ou atualizar atribuição
                const userPerfil = await prismaclient_1.prisma.userPerfil.upsert({
                    where: {
                        user_id_perfil_id: {
                            user_id: atribuicao.usuario_id,
                            perfil_id: atribuicao.perfil_id,
                        }
                    },
                    update: {},
                    create: {
                        user_id: atribuicao.usuario_id,
                        perfil_id: atribuicao.perfil_id,
                    },
                });
                results.push(userPerfil);
            }
            // Atualizar contadores de usuários nos perfis
            for (const atribuicao of atribuicoes) {
                const count = await prismaclient_1.prisma.userPerfil.count({
                    where: { perfil_id: atribuicao.perfil_id }
                });
                await prismaclient_1.prisma.perfil.update({
                    where: { id: atribuicao.perfil_id },
                    data: { usuarios_count: count }
                });
            }
            return reply.status(201).send({
                message: "Perfis atribuídos com sucesso",
                count: results.length
            });
        }
        catch (error) {
            console.error("Erro ao atribuir perfis:", error);
            return reply.status(500).send({ error: "Erro ao atribuir perfis" });
        }
    });
};
exports.AtribuirPerfilUsuario = AtribuirPerfilUsuario;
