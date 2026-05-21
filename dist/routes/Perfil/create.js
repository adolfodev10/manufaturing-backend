"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePerfil = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const CreatePerfil = async (app) => {
    app.withTypeProvider().post("/perfis", {
        schema: {
            body: zod_1.default.object({
                nome: zod_1.default.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
                descricao: zod_1.default.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
                nivel: zod_1.default.number().int().min(1).max(5).default(1),
                permissoes: zod_1.default.array(zod_1.default.string().uuid()).default([]),
                is_default: zod_1.default.boolean().default(false),
            }),
        },
    }, async (req, reply) => {
        try {
            const { nome, descricao, nivel, permissoes, is_default } = req.body;
            // Verificar se já existe um perfil com o mesmo nome
            const perfilExistente = await prismaclient_1.prisma.perfil.findUnique({
                where: { nome },
            });
            if (perfilExistente) {
                return reply.status(400).send({ error: "Já existe um perfil com este nome" });
            }
            // Se for perfil padrão, remover padrão de outros perfis
            if (is_default) {
                await prismaclient_1.prisma.perfil.updateMany({
                    where: { is_default: true },
                    data: { is_default: false },
                });
            }
            const perfil = await prismaclient_1.prisma.perfil.create({
                data: {
                    nome,
                    descricao,
                    nivel,
                    permissoes: JSON.stringify(permissoes),
                    is_default,
                    usuarios_count: 0,
                },
            });
            return reply.status(201).send({
                ...perfil,
                permissoes: JSON.parse(perfil.permissoes)
            });
        }
        catch (error) {
            console.error("Erro ao criar perfil:", error);
            return reply.status(500).send({ error: "Erro ao criar perfil" });
        }
    });
};
exports.CreatePerfil = CreatePerfil;
