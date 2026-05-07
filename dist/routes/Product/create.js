"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProduct = void 0;
const create_product_1 = require("../../modules/validations/product/create-product");
const prismaclient_1 = require("../../lib/prismaclient");
const CreateProduct = async (app) => {
    app.withTypeProvider().post('/product/create', {
        schema: {
            body: create_product_1.createProductSchema
        },
    }, async (request, reply) => {
        const { name_product, price, description, quantity, date_validate } = request.body;
        const productExists = await prismaclient_1.prisma.products.findFirst({
            where: {
                OR: [
                    {
                        name_product,
                    },
                ],
            }
        });
        if (productExists)
            return reply.status(200).send({ productExists });
        const products = await prismaclient_1.prisma.products.create({
            data: {
                name_product: name_product ?? "",
                price,
                description,
                date_validate: date_validate,
                quantity: quantity,
            }
        });
        return reply.code(201).send({ products });
    });
};
exports.CreateProduct = CreateProduct;
