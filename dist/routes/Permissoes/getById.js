"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuscarPermissaoPorId = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const BuscarPermissaoPorId = async (app) => {
    app.withTypeProvider().get("/permissoes/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
        },
    }, async (req, reply) => {
        try {
            const { id } = req.params;
            const permissao = await prismaclient_1.prisma.permissao.findUnique({
                where: { id },
            });
            if (!permissao) {
                return reply.status(404).send({ error: "Permissão não encontrada" });
            }
            return reply.status(200).send(permissao);
        }
        catch (error) {
            console.error("Erro ao buscar permissão:", error);
            return reply.status(500).send({ error: "Erro ao buscar permissão" });
        }
    });
};
exports.BuscarPermissaoPorId = BuscarPermissaoPorId;
