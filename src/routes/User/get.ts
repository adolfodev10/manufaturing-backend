import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";

export const GetUser = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/user/getAll', {},
        async (request, reply) => {
            const users = await prisma.users.findMany();
            return reply.status(200).send(users);
        });
}