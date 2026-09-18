import { z } from "zod";

export const createCategoriaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(60, "Nome muito longo")
    .transform((v) => v.trim()),
  descricao: z.string().max(200).optional(),
});

export const updateCategoriaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(60, "Nome muito longo")
    .transform((v) => v.trim())
    .optional(),
  descricao: z.string().max(200).optional(),
  ativo: z.boolean().optional(),
});

export const categoriaIdParamsSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;