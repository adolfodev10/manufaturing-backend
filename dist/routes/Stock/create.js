"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStockProduct = void 0;
const create_product_1 = require("../../modules/validations/product/create-product");
const prismaclient_1 = require("../../lib/prismaclient");
const crypto_1 = require("crypto");
const CreateStockProduct = async (app) => {
    app.withTypeProvider().post('/stock/create', {
        schema: {
            body: create_product_1.createProductSchema
        },
    }, async (request, reply) => {
        const { name, price, category, quantity, date_validate } = request.body;
        const productExists = await prismaclient_1.prisma.estoque.findFirst({
            where: {
                OR: [
                    {
                        name: name,
                    },
                ],
            }
        });
        if (productExists)
            return reply.status(400).send({ error: "Product name already exists" });
        const products = await prismaclient_1.prisma.estoque.create({
            data: {
                name: name ?? "",
                price,
                category: category,
                date_validate: date_validate,
                quantity: quantity,
                updated_at: new Date(),
                id_estoque: (0, crypto_1.randomUUID)(),
            }
        });
        return reply.code(201).send({ products });
    });
};
exports.CreateStockProduct = CreateStockProduct;
