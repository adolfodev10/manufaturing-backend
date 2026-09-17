import { z } from "zod";

export const CaixaStatusEnum = z.enum(["ABERTA", "FECHADA"]);

export const createCaixaSchema = z.object({
  operador: z.string().min(1),
  operador_id: z.string().uuid(),
  valorInicial: z.coerce.number().min(0).default(0),
  observacoes: z.string().optional(),
});

export const fecharCaixaSchema = z.object({
  caixaId: z.string().uuid(),
  valorFinal: z.coerce.number().min(0).optional(),
  observacoes: z.string().optional(),
});

export const listarCaixaQuerySchema = z.object({
  operadorId: z.string().uuid().optional(),
  status: CaixaStatusEnum.optional(),
});

export type CreateCaixaInput = z.infer<typeof createCaixaSchema>;
export type FecharCaixaInput = z.infer<typeof fecharCaixaSchema>;