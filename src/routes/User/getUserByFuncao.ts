import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

export const GetUserByFuncao = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/user/getUserByRole", {
        schema: {
            querystring: z.object({
                role: z.enum(["ADMINISTRADOR", "OPERADOR", "GERENTE"]),
            }),
        },
    },
        async (req) => {
            const { role } = req.query;

            const roles = await prisma.users.findMany({
                where: {
                    role,
                },
            });

            return roles;
        }
    );
};
