"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name_product: zod_1.z.string().min(3, { message: 'Name must be at least 3 characters long' }).refine((value) => value.trim() !== '', { message: 'Name must not be empty' }).optional(),
    price: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    date_validate: zod_1.z.string(),
    quantity: zod_1.z.string().min(1)
});
