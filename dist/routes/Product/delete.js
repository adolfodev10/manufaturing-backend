"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProduct = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const DeleteProduct = async (app) => {
    app.withTypeProvider().delete("/product/delete/:id_product", {
        schema: {
            params: zod_1.z.object({
                id_product: zod_1.z.string().nonempty("O Campo id é obriigatório."),
            }),
        },
    }, async (req, reply) => {
        const { id_product } = req.params;
        const product = await prismaclient_1.prisma.products.findUnique({
            where: {
                id_product,
            },
        });
        if (!product) {
            return reply.status(404).send({ message: "Produto não encontrado" });
        }
        await prismaclient_1.prisma.products.delete({
            where: {
                id_product,
            },
        });
        return reply.status(200).send({ message: "Produto apagado com sucesso" });
    });
};
exports.DeleteProduct = DeleteProduct;
