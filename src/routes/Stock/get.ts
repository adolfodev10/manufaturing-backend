import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";

export const GetAllProductStock = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/stock/getAll', {},
        async (req, reply) => {
            const stock = await prisma.estoque.findMany({});
            return reply.status(200).send(stock);
        });
} 