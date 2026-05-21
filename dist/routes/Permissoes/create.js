"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePermissao = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const CreatePermissao = async (app) => {
    app.withTypeProvider().post("/permissoes", {
        schema: {
            body: zod_1.default.object({
                nome: zod_1.default.string(),
                descricao: zod_1.default.string(),
                modulo: zod_1.default.string(),
                acao: zod_1.default.enum(["criar", "ler", "atualizar", "deletar", "exportar", "importar", "configurar"]),
                recurso: zod_1.default.string(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { nome, descricao, modulo, acao, recurso } = req.body;
            const permissao = await prismaclient_1.prisma.permissao.create({
                data: {
                    nome,
                    descricao,
                    modulo,
                    acao,
                    recurso,
                },
            });
            return reply.status(201).send(permissao);
        }
        catch (error) {
            console.error("Erro ao criar permissão:", error);
            return reply.status(500).send({ error: "Erro ao criar permissão" });
        }
    });
};
exports.CreatePermissao = CreatePermissao;
