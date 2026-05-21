"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createUserSchema = zod_1.default.object({
    name: zod_1.default.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    email: zod_1.default.string().email({ message: "Email inválido" }),
    senha: zod_1.default.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    phone_number: zod_1.default.string().optional(),
    avatar: zod_1.default.string().optional(),
    born: zod_1.default.string().or(zod_1.default.date()),
    role: zod_1.default.enum(["ADMINISTRADOR", "GERENTE", "OPERADOR"]).optional().default("OPERADOR"),
    user_status: zod_1.default.enum(["ACTIVO", "INACTIVO"]).optional().default("ACTIVO"),
});
