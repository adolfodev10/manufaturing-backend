"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createClientSchema = zod_1.default.object({
    name: zod_1.default.string()
        .min(3, { message: 'Name must be at least 3 characters long' })
        .refine((value) => value.trim() !== '', { message: 'Name must not be empty' }),
    telefone: zod_1.default.string().min(9, { message: 'Telefone must be at least 9 characters long' }).optional(),
});
