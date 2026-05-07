// Correção da rota no backend
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const GetInvoicesByClientId = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/invoice/client/:client_id", {
        schema: {
            params: z.object({
                client_id: z.string(),
            })
        }
    },
        async (req, reply) => {
            const { client_id } = req.params;

            const invoices = await prisma.invoices.findMany({
                where: {
                    clients: {
                        id_client: client_id,
                    }
                }
            });

            if (!invoices || invoices.length === 0) {
                return reply.status(404).send({ message: "Cliente sem dividas" });
            }
            
            return reply.status(200).send(invoices);
        }
    )
}