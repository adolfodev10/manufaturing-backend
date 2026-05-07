"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClientBodySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.UpdateClientBodySchema = zod_1.default.object({
    name: zod_1.default.string(),
    telefone: zod_1.default.string().min(9, { message: 'Telefone must be at least 9 characters long' }).optional(),
});
