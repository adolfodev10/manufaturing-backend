import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createUserSchema } from "../../modules/validations/user/create";
import { prisma } from "../../lib/prismaclient";
import { hashPassword } from "../../modules/services/bcrypt/hashPassword";
import { generateTemporaryPassword } from "../../modules/services/api/auth/generatePassword";
import { sendWelcomeEmail } from "../../lib/mailer";


type Role = "OPERADOR" | "GERENTE" | "ADMINISTRADOR"


export const CreateUser = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/user/create', {
        schema: {
            body: createUserSchema
        },
    },
        async (req, res) => {
            const { name, email, phone_number, avatar, born, role } = req.body;

            console.log("🔍 Buscando por:", { email, phone_number });
            const userExists = await prisma.users.findFirst({
                where: {
                    OR: [
                        { email },
                        ...(phone_number ? [{ phone_number }] : [])
                    ]
                }
            });

            console.log("🔍 userExists:", userExists);

            if (userExists) {
                const isEmailConflict = userExists.email === email;

                return res.status(400).send({
                    error:isEmailConflict
                    ? "Este email já está em uso"
                    : "Este número de telefone já está em uso",
                    field: isEmailConflict ? 'email' : 'phone_number'
                });
            }

            const validRoles: Role[] = ["OPERADOR", "GERENTE", "ADMINISTRADOR"];

            let userRole: Role = "OPERADOR";
            if (role) {
                const normalizedRole = role.toUpperCase();
                if (validRoles.includes(normalizedRole as Role)) {
                    userRole = normalizedRole as Role;
                } else {
                    return res.status(400).send({
                        error: "Role inválida. As opções válidas são: OPERADOR, GERENTE, ADMINISTRADOR"
                    });
                }
            }

            try {

                if (!born) {
                    return res.status(400).send({ error: "Data de nascimento é obrigatória" });
                }
                const bornDate = new Date(born);
                if (isNaN(bornDate.getTime())) {
                    return res.status(400).send({ error: "Data de nascimento inválida" });
                }

                const temporaryPassword = generateTemporaryPassword(10);
                const hashedPassword = await hashPassword(temporaryPassword);
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const user = await prisma.users.create({
                    data: {
                        name,
                        email,
                        senha: hashedPassword,
                        phone_number: phone_number || null,
                        avatar: avatar || null,
                        born: bornDate,
                        role: userRole,
                        user_status: "PENDENTE",
                        must_change_password: true,
                        password_expires_at: expiresAt,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                });

                await prisma.notification.create({
                    data: {
                        user_id: user.id_user,
                        message: "Seja Bem-vindo ao sistema!",
                        created_at: new Date(),
                        updated_at: new Date(),
                    }
                });

                let emailSent = false;
                let emailError: string | null = null;

                try {
                    await sendWelcomeEmail({
                        to: email,
                        name,
                        password: temporaryPassword,
                        role: userRole,
                        expiresAt,
                    });
                    emailSent = true;
                } catch (err) {
                    emailError = err instanceof Error ? err.message : "Erro desconhecido";
                    console.error("Erro ao enviar email de boas-vindas:", emailError);
                }

                const { senha: _, ...userWithoutPassword } = user;

                return res.status(201).send({
                    success: true,
                    message: emailSent ? "Usuário criado com sucesso" : "Usuário criado com sucesso, mas houve um erro ao enviar o email de boas-vindas",
                    emailSent,
                    emailError,
                    user: userWithoutPassword
                });
            }
            catch (error) {
                console.error("Error creating user:", error);
                return res.status(500).send({
                    error: "Erro interno ao criar usuário",
                    details: process.env.NODE_ENV === 'development' ? error : undefined
                });
            }
        },
    );
}; 