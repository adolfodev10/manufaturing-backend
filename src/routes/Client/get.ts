import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";

export const GetClient = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/client/getAll", {},
        async (req, res) => {
            const client = await prisma.clients.findMany({
                select:{
                    id_client:true,
                    name:true,
                    telefone:true,
                    nif:true,
                    invoices:true,
                },
            });
            const response = client.map(client => ({
                id: client.id_client,
                name: client.name,
                telefone:client.telefone,
                nif:client.nif,
                invoices: client.invoices
            }))
            return res.status(200).send(client);
        });
};
