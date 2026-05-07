"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVenda = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const create_venda_1 = require("../../modules/validations/venda/create-venda");
// import { fastify } from "../../lib/fastify";
const CreateVenda = async (app) => {
    app.withTypeProvider().post('/venda/create', {
        schema: {
            body: create_venda_1.createVendaSchema
        },
    }, async (req, res) => {
        const { id, description, status, date_venda, methodPayment, price, date_validate, name_product, quantity, created_at, updated_at } = req.body;
        const venda = await prismaclient_1.prisma.venda.create({
            data: {
                id,
                name_product: name_product ?? "",
                description: description ?? "",
                status: status ?? "VENDIDO",
                methodPayment,
                price: price ?? 0,
                date_validate: date_validate,
                quantity: quantity ?? "",
                date_venda: date_venda,
                created_at: new Date(created_at),
                updated_at: new Date(updated_at),
            }
        });
        // fastify.io.emit("admin_notificatin", {
        //     type: "venda",
        //     title: "Produto Vendido",
        //     message: `O produto ${vendaExists.name_product} foi vendido.`,
        //     vendaId: vendaExists.id
        // })
        return res.status(200).send(venda);
    });
};
exports.CreateVenda = CreateVenda;
