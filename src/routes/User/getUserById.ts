import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

export const GetUserById = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/user/:userId', {
        schema: {
            params: z.object({
                userId: z.string(),
            })
        }
    },
        async (request, reply) => {
            const { userId } = request.params;

            const user = await prisma.users.findUnique({
                where: {
                    id_user: userId,
                    user_status: "ACTIVO",
                },
            });

            if (user?.user_status === "INATIVO") {
                throw new Error("User is Inactive");
            }

            if (!user) {
                throw new Error("User not found");
            }
            return reply.status(200).send(user);
        }
    )
}