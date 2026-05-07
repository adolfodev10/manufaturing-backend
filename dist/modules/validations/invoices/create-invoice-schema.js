"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.createInvoiceSchema = zod_1.z.object({
    client_id: zod_1.z.string().uuid().optional(),
    product_id: zod_1.z.string().uuid(),
    price: zod_1.z.string(),
    approval: zod_1.z.string().optional(),
    date: zod_1.z.coerce.date(),
});
