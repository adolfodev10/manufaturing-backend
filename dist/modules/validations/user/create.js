"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createUserSchema = zod_1.default.object({
    name: zod_1.default.string()
        .min(3, { message: "Name must be at least 3 characters long" })
        .refine((value) => value.trim() !== "", { message: "Name must not be empty" }),
    email: zod_1.default.string()
        .email({ message: "Invalid email address" })
        .refine((value) => value.trim() !== "", { message: "Email mmust not be empty" }),
    senha: zod_1.default.string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .refine((value) => value.trim() !== "", { message: "Password must not be empty" }),
    phone_number: zod_1.default.string()
        .min(9, { message: "Phone number must be at least 9 characters long" }),
    avatar: zod_1.default.string().optional(),
    born: zod_1.default.coerce.date({ errorMap: () => ({ message: "Invalid date format" }) }),
    funcao_id: zod_1.default.string().uuid({ message: "Invalid function ID" }),
});
