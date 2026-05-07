import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

export const GetUserByFuncao = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/user/getUserByRole', {
        schema: {
            body: z.object({
                role: z.enum(["ADMINISTRADOR", "OPERADOR"]),
            })
        }
    },
        async (req) => {
            const { role } = req.body;

            const roles = await prisma.users.findMany({
                where: {
                    role
                }
            });
            return roles;
        }
    )
}