"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditStock = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const EditStock = async (app) => {
    app.withTypeProvider().put('/stock/update/:id_stock', {
        schema: {
            params: zod_1.z.object({
                id_stock: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                name: zod_1.z.string().optional(),
                description: zod_1.z.string().optional(),
                price: zod_1.z.string().optional(),
                quantity: zod_1.z.string().optional(),
                date_validate: zod_1.z.string(),
            }),
        },
    }, async (req, reply) => {
        const { id_stock } = req.params;
        const { name, description, price, quantity, date_validate } = req.body;
        if (!id_stock) {
            return reply.status(400).send({ message: "O campo id é obrigatório" });
        }
        const stockExists = await prismaclient_1.prisma.stock.findUnique({
            where: {
                id_stock: id_stock,
            },
        });
        if (!stockExists) {
            return reply.status(404).send({ message: "Produto não encontrado" });
        }
        const stock = await prismaclient_1.prisma.stock.update({
            where: {
                id_stock: stockExists.id_stock,
            },
            data: {
                name,
                description,
                price,
                quantity,
                date_validate,
            },
        });
        if (Number(stock.quantity) <= 0) {
            await prismaclient_1.prisma.stock.delete({
                where: {
                    id_stock: stockExists.id_stock,
                },
            });
            return reply.status(200).send({ message: "Produto apagado com sucesso" });
        }
        return reply.status(200).send({ message: "Produto atualizado com sucesso" });
    });
};
exports.EditStock = EditStock;
