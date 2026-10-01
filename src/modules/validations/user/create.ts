import z from "zod";

export const createUserSchema = z.object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    phone_number: z.string().optional(),
    avatar: z.string().optional(),
    born: z.string().or(z.date()),
    role: z.enum(["ADMINISTRADOR", "GERENTE", "OPERADOR"]).optional().default("OPERADOR"),
});
