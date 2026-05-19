import { z } from "zod";

export const createDividaSchema = z.object({
    id_divida: z.string().uuid(),
    client_id: z.string().uuid(),
    product_id: z.string().uuid().optional(),
    price: z.string(),
    date: z.coerce.date(),
    approval: z.string(),
    created_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional()
})