"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditStock = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const EditStock = async (app) => {
    app.withTypeProvider().put('/stock/edit/:id_estoque', {
        schema: {
            params: zod_1.z.object({
                id_estoque: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                name: zod_1.z.string().optional(),
                category: zod_1.z.string().optional(),
                price: zod_1.z.string().optional(),
                quantity: zod_1.z.string().optional(),
                date_validate: zod_1.z.string(),
            }),
        },
    }, async (req, reply) => {
        const { id_estoque } = req.params;
        const { name, category, price, quantity, date_validate } = req.body;
        if (!id_estoque) {
            return reply.status(400).send({ message: "O campo id é obrigatório" });
        }
        const stockExists = await prismaclient_1.prisma.estoque.findUnique({
            where: {
                id_estoque,
            },
        });
        if (!stockExists) {
            return reply.status(404).send({ message: "Produto não encontrado" });
        }
        const stock = await prismaclient_1.prisma.estoque.update({
            where: {
                id_estoque,
            },
            data: {
                name,
                category,
                price: price || stockExists.price,
                quantity: quantity || stockExists.quantity,
                date_validate,
            },
        });
        if (Number(stock.quantity) <= 0) {
            await prismaclient_1.prisma.estoque.delete({
                where: {
                    id_estoque,
                },
            });
            return reply.status(200).send({ message: "Produto apagado com sucesso" });
        }
        return reply.status(200).send(stock);
    });
};
exports.EditStock = EditStock;
