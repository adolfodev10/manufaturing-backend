"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProductInStock = void 0;
const add_product_1 = require("../../modules/validations/product/add-product");
const prismaclient_1 = require("../../lib/prismaclient");
const AddProductInStock = async (app) => {
    app.withTypeProvider().post('/product/add', {
        schema: {
            body: add_product_1.addProductSchema
        },
    }, async (req, reply) => {
        const { name_product, price, quantity, date_validate, description, user_id } = req.body;
        const addProduct = await prismaclient_1.prisma.products.create({
            data: {
                name_product: name_product ?? "",
                description,
                date_validate: date_validate ?? "",
                price,
                quantity
            }
        });
        return reply.status(200).send({ addProduct });
    });
};
exports.AddProductInStock = AddProductInStock;
