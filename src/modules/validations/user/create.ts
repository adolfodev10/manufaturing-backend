import z from "zod";

export const createUserSchema = z.object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    senha: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    phone_number: z.string().optional(),
    avatar: z.string().optional(),
    born: z.string().or(z.date()),
    role: z.enum(["ADMINISTRADOR", "GERENTE", "OPERADOR"]).optional().default("OPERADOR"),
    user_status: z.enum(["ACTIVO", "INACTIVO"]).optional().default("ACTIVO"),
});
