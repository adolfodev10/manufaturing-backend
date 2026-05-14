import { z } from "zod";

export const createVendaSchema = z.object({
  name_product: z.string().min(1, "Nome do produto é obrigatório"),
  category: z.string().optional(),
  methodPayment: z.enum(["MISTO", "CACHE", "TPA"]),
  date_validate: z.string(),
  price: z.string(),
  quantity: z.string().optional(),
  estado: z
    .enum(["VENDIDO", "VENDENDO", "NAO_VENDIDO", "EXPIRADO"])
    .optional(),
  date_venda: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  client_name: z.string().optional(),
  client_nif: z.string().optional(),
  payment_details: z.string().optional(),
});
