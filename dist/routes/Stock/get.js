"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllProductStock = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const GetAllProductStock = async (app) => {
    app.withTypeProvider().get('/stock/getAll', {}, async (req, reply) => {
        const stock = await prismaclient_1.prisma.stock.findMany({});
        return reply.status(200).send(stock);
    });
};
exports.GetAllProductStock = GetAllProductStock;
