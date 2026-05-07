"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInvoice = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const create_invoice_schema_1 = require("../../modules/validations/invoices/create-invoice-schema");
const CreateInvoice = async (app) => {
    app.withTypeProvider().post("/invoice/create", {
        schema: {
            body: create_invoice_schema_1.createInvoiceSchema
        },
    }, async (req, reply) => {
        const { client_id, product_id, approval, price, date } = req.body;
        const invoice = await prismaclient_1.prisma.invoices.create({
            data: {
                client_id,
                product_id,
                price,
                date,
                approval: "NAO_PAGAS"
            }
        });
        return reply.code(201).send({ invoice });
    });
};
exports.CreateInvoice = CreateInvoice;
