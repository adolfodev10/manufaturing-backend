import z from "zod";

export const UpdateClientBodySchema = z.object({
    name: z.string(),
    telefone: z.string().min(9, { message: 'Telefone must be at least 9 characters long' }).optional(),
});