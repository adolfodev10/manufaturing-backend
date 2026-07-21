"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePedidoCompra = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const CreatePedidoCompra = async (app) => {
    app.withTypeProvider().post('/fornecedores/pedido', {
        schema: {
            body: zod_1.default.object({
                fornecedor_id: zod_1.default.string(),
                data_entrega: zod_1.default.string().optional(),
                itens: zod_1.default.array(zod_1.default.object({
                    materia_prima_id: zod_1.default.string(),
                    quantidade: zod_1.default.number(),
                    preco_unitario: zod_1.default.number(),
                })),
            }),
        },
    }, async (request, reply) => {
        const { fornecedor_id, data_entrega, itens } = request.body;
        try {
            const valor_total = itens.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
            const compra = await prismaclient_1.prisma.compras.create({
                data: {
                    fornecedor_id,
                    data_entrega: data_entrega ? new Date(data_entrega) : null,
                    valor_total,
                },
            });
            return reply.status(201).send(compra);
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
};
exports.CreatePedidoCompra = CreatePedidoCompra;
