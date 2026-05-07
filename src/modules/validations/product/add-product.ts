import { z } from "zod";

export const addProductSchema = z.object({
    name_product: z.string().optional(),
    price: z.string(),
    category: z.string().optional(),
    user_id: z.string().optional(),
    date_validate: z.string().optional(),
    quantity: z.string().min(1)
})