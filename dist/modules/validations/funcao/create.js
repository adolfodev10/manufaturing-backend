"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFuncaoSchema = exports.singleFuncaoSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.singleFuncaoSchema = zod_1.default.object({
    name_funcao: zod_1.default.string()
        .min(3, { message: 'Name must be at least 3 characters long' })
        .refine((value) => value.trim() !== '', { message: 'Name must not be empty' }),
    description: zod_1.default.string()
        .min(10, { message: 'Description must be at least 10 characters long' })
        .optional(),
    user: zod_1.default.string().uuid().optional(),
});
exports.createFuncaoSchema = zod_1.default.union([
    exports.singleFuncaoSchema,
    zod_1.default.array(exports.singleFuncaoSchema)
]);
