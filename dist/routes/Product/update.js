"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditProduct = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const EditProduct = async (app) => {
    app.withTypeProvider().put('/product/edit/:id_product', {
        schema: {
            params: zod_1.z.object({
                id_product: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                name_product: zod_1.z.string().optional(),
                description: zod_1.z.string().optional(),
                price: zod_1.z.string().optional(),
                quantity: zod_1.z.string().optional(),
                date_validate: zod_1.z.string(),
            }),
        },
    }, async (req, reply) => {
        const { id_product } = req.params;
        const { name_product, description, price, quantity, date_validate } = req.body;
        if (!id_product) {
            return reply.status(400).send({ message: "O campoo id é obrigatorio" });
        }
        const productExists = await prismaclient_1.prisma.products.findUnique({
            where: {
                id_product,
            },
        });
        if (!productExists) {
            return reply.status(404).send({ message: "Produto nao encontrado" });
        }
        const product = await prismaclient_1.prisma.products.update({
            where: {
                id_product,
            },
            data: {
                name_product,
                description,
                price: price || productExists.price,
                quantity: quantity || productExists.quantity,
                date_validate,
            },
        });
        if (Number(product.quantity) <= 0) {
            await prismaclient_1.prisma.products.delete({
                where: {
                    id_product,
                },
            });
            return reply.status(200).send({ message: "Produto apagado com sucesso" });
        }
        return reply.status(200).send(product);
    });
};
exports.EditProduct = EditProduct;
