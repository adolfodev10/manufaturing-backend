"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDividaSchema = void 0;
const zod_1 = require("zod");
exports.createDividaSchema = zod_1.z.object({
    id_divida: zod_1.z.string().uuid(),
    client_id: zod_1.z.string().uuid(),
    product_id: zod_1.z.string().uuid().optional(),
    price: zod_1.z.string(),
    date: zod_1.z.coerce.date(),
    approval: zod_1.z.string(),
    created_at: zod_1.z.coerce.date().optional(),
    updated_at: zod_1.z.coerce.date().optional()
});
