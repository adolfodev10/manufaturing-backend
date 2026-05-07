"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProductSchema = void 0;
const zod_1 = require("zod");
exports.addProductSchema = zod_1.z.object({
    name_product: zod_1.z.string().optional(),
    price: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    user_id: zod_1.z.string().optional(),
    date_validate: zod_1.z.string().optional(),
    quantity: zod_1.z.string().min(1)
});
