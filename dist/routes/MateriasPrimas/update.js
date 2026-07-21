"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMateriaPrima = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const UpdateMateriaPrima = async (app) => {
    app.withTypeProvider().put('/materias-primas/update/:id', {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
            body: zod_1.default.object({
                nome: zod_1.default.string().optional(),
                descricao: zod_1.default.string().optional(),
                codigo: zod_1.default.string().optional(),
                unidade: zod_1.default.string().optional(),
                categoria: zod_1.default.string().optional(),
                quantidade_atual: zod_1.default.number().optional(),
                quantidade_minima: zod_1.default.number().optional(),
                preco_medio: zod_1.default.number().optional(),
                fornecedor_id: zod_1.default.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const data = request.body;
        try {
            const materia = await prismaclient_1.prisma.materiasPrimas.update({
                where: { id },
                data,
            });
            return reply.send(materia);
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
};
exports.UpdateMateriaPrima = UpdateMateriaPrima;
