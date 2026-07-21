"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMateriaPrima = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const CreateMateriaPrima = async (app) => {
    app.withTypeProvider().post('/materias-primas/create', {
        schema: {
            body: zod_1.default.object({
                nome: zod_1.default.string(),
                descricao: zod_1.default.string().optional(),
                codigo: zod_1.default.string().optional(),
                unidade: zod_1.default.string().default("KG"),
                categoria: zod_1.default.string().optional(),
                quantidade_atual: zod_1.default.number().default(0),
                quantidade_minima: zod_1.default.number().default(10),
                preco_medio: zod_1.default.number().optional(),
                fornecedor_id: zod_1.default.string().optional(),
            }),
        },
    }, async (request, reply) => {
        try {
            const materia = await prismaclient_1.prisma.materiasPrimas.create({
                data: request.body,
            });
            return reply.status(201).send(materia);
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
};
exports.CreateMateriaPrima = CreateMateriaPrima;
