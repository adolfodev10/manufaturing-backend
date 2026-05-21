"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendaSchema = void 0;
const zod_1 = require("zod");
exports.createVendaSchema = zod_1.z.object({
    name_product: zod_1.z.string().min(1, "Nome do produto é obrigatório"),
    category: zod_1.z.string().optional(),
    methodPayment: zod_1.z.enum(["MISTO", "CACHE", "TPA"]),
    date_validate: zod_1.z.string(),
    price: zod_1.z.string(),
    quantity: zod_1.z.string().optional(),
    estado: zod_1.z
        .enum(["VENDIDO", "VENDENDO", "NAO_VENDIDO", "EXPIRADO"])
        .optional(),
    date_venda: zod_1.z.string().optional(),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string(),
    user_id: zod_1.z.string().uuid().optional()
});
