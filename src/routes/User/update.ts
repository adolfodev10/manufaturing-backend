import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

export const UpdateUser = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put('/user/edit/:id', {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
            body: z.object({
                name: z.string().min(3).optional(),
                email: z.string().email().optional(),
                born: z.string().datetime().optional().nullable(),
                phone_number: z.string().min(7).optional().nullable(),
                avatar: z.string().optional().nullable(),
                user_status: z.enum(["ACTIVO", "INATIVO"]).optional(),
                role: z.enum(["ADMINISTRADOR", "OPERADOR", "GERENTE"]).optional(),
            }).refine(
                (data) => Object.keys(data).length > 0,
                { message: "Pelo menos um campo deve ser fornecido" }
            ),
        },
    },
        async (req, res) => {
            const { id } = req.params;
            const { name, email, born, phone_number, avatar, user_status, role } = req.body;

            const existingUser = await prisma.users.findUnique({
                where: { id_user: id },
            });

            if (!existingUser) {
                return res.status(404).send({ message: "Usuário não encontrado" });
            }

            if (email && email !== existingUser.email) {
                const emailEmUso = await prisma.users.findFirst({
                    where: { email, NOT: { id_user: id } },
                });
                if (emailEmUso) {
                    return res.status(400).send({ message: "Email já está em uso" });
                }
            }

            if (phone_number && phone_number !== existingUser.phone_number) {
                const phoneEmUso = await prisma.users.findFirst({
                    where: { phone_number, NOT: { id_user: id } },
                });
                if (phoneEmUso) {
                    return res.status(400).send({ message: "Telefone já está em uso" });
                }
            }

            const data: Record<string, unknown> = {};

            if (name !== undefined) data.name = name;
            if (email !== undefined) data.email = email;
            if (phone_number !== undefined) data.phone_number = phone_number;
            if (avatar !== undefined) data.avatar = avatar;
            if (user_status !== undefined) data.user_status = user_status;
            if (role !== undefined) data.role = role;

            if (born !== undefined && born !== null) {
                const d = new Date(born);
                if (isNaN(d.getTime())) {
                    return res.status(400).send({ message: "Data de nascimento inválida" });
                }
                data.born = d;
            }

            try {
                const user = await prisma.users.update({
                    where: { id_user: id },
                    data,
                    select: {
                        id_user: true,
                        name: true,
                        email: true,
                        phone_number: true,
                        avatar: true,
                        born: true,
                        user_status: true,
                        role: true,
                        created_at: true,
                        updated_at: true,
                    },
                });

                return res.status(200).send({
                    message: "Usuário atualizado com sucesso",
                    user,
                });
            } catch (error: any) {
                if (error?.code === "P2002") {
                    return res.status(400).send({
                        message: `Valor duplicado no campo: ${error.meta?.target}`,
                    });
                }
                console.error("Erro ao atualizar usuário:", error);
                return res.status(500).send({ message: "Erro ao atualizar o usuário" });
            }
        }
    );
};