import { z } from "zod";

export const createProductSchema = z.object({
    name: z
        .string({ required_error: "Nome é obrigatório" })
        .min(3, { message: "Name must be at least 3 characters long" })
        .refine((value) => value.trim() !== "", { message: "Name must not be empty" }),
    price: z.string(),
    category: z.string().optional(),
    categoriaId: z.string().uuid().optional(),
    preco_compra: z.string().optional(),
    date_validate: z
        .string()
        .optional()
        .refine((v) => !v || !isNaN(Date.parse(v)), { message: "Data inválida" }),
    quantity: z.string().min(1),
});


export const createEstoqueSchema = z.object({
    name: z
        .string({ required_error: "Nome é obrigatório" })
        .min(3, { message: "Name must be at least 3 characters long" })
        .refine((value) => value.trim() !== "", { message: "Name must not be empty" }),
    price: z.string(),
    category: z.string().optional(),
    categoriaId: z.string().min(1, "Selecione uma categoria"),
    preco_compra: z.string().optional(),
    date_validate: z
        .coerce.date()
        .optional(),
    quantity: z.string().min(1),
});