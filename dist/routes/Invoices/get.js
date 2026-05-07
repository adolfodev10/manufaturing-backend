"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllInvoice = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const GetAllInvoice = async (app) => {
    app.withTypeProvider().get('/invoice/getAll', {}, async () => {
        const invoices = await prismaclient_1.prisma.invoices.findMany();
        return { invoices };
    });
};
exports.GetAllInvoice = GetAllInvoice;
