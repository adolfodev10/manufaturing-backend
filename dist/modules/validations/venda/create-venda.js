"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendaSchema = void 0;
const zod_1 = require("zod");
exports.createVendaSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name_product: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    methodPayment: zod_1.z.enum(["MULTICAIXA_EXPRESS", "CACHE", "TPA"]),
    date_validate: zod_1.z.string(),
    price: zod_1.z.string(),
    quantity: zod_1.z.string().optional(),
    status: zod_1.z.enum(["VENDIDO", "VENDENDO", "NAO_VENDIDO", "EXPIRADO"]).optional(),
    date_venda: zod_1.z.string().optional(),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string(),
});
