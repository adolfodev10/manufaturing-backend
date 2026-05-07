import z from "zod";

export const singleFuncaoSchema = z.object({
    name_funcao: z.string()
        .min(3, { message: 'Name must be at least 3 characters long' })
        .refine((value) => value.trim() !== '', { message: 'Name must not be empty' }),

    category: z.string()
        .min(10, { message: 'Category must be at least 10 characters long' })
        .optional(),

    user: z.string().uuid().optional(),
});

export const createFuncaoSchema = z.union([
    singleFuncaoSchema,
    z.array(singleFuncaoSchema)
]);
