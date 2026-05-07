"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStockProduct = void 0;
const create_product_1 = require("../../modules/validations/product/create-product");
const prismaclient_1 = require("../../lib/prismaclient");
const CreateStockProduct = async (app) => {
    app.withTypeProvider().post('/stock/create', {
        schema: {
            body: create_product_1.createProductSchema
        },
    }, async (request, reply) => {
        const { name_product, price, description, quantity, date_validate } = request.body;
        const productExists = await prismaclient_1.prisma.stock.findFirst({
            where: {
                OR: [
                    {
                        name: name_product,
                    },
                ],
            }
        });
        if (productExists)
            return reply.status(400).send({ error: "Product name already exists" });
        const products = await prismaclient_1.prisma.stock.create({
            data: {
                name: name_product ?? "",
                price,
                description: description,
                date_validate: date_validate,
                quantity: quantity,
            }
        });
        return reply.code(201).send({ products });
    });
};
exports.CreateStockProduct = CreateStockProduct;
