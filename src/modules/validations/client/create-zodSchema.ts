import z from "zod";

export const createClientSchema = z.object({
    name: z.string()
        .min(3, { message: 'Name must be at least 3 characters long' })
        .refine((value) => value.trim() !== '', { message: 'Name must not be empty' }),
    telefone: z.string().min(9, { message: 'Telefone must be at least 9 characters long' }).optional(),
});