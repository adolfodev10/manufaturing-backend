"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const deleteProduct = async (app) => {
    app.withTypeProvider().delete("/stock/delete/:id_estoque", {
        schema: {
            params: zod_1.z.object({
                id_estoque: zod_1.z.string().nonempty("O Campo id é obrigatório."),
            }),
        },
    }, async (req, reply) => {
        const { id_estoque } = req.params;
        const product = await prismaclient_1.prisma.estoque.findUnique({
            where: {
                id_estoque,
            },
        });
        if (!product) {
            return reply.status(404).send({ message: "Produto não encontrado" });
        }
        await prismaclient_1.prisma.estoque.delete({
            where: {
                id_estoque,
            },
        });
        return reply.status(200).send({ message: "Produto apagado com sucesso" });
    });
};
exports.deleteProduct = deleteProduct;
