import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const UpdateInvoice = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put("/invoice/update/:id", {
        schema: {
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                client_id: z.string(),
                price: z.string(),
                date: z.string(),
                approval: z.enum(['PAGAS', 'NAO_PAGAS']),
            }),
        }
    },
        async (req, reply) => {
            const { id } = req.params;
            const { client_id, price, date, approval } = req.body;
            const invoice = await prisma.invoices.update({
                where: {
                    id_invoice: id,
                },
                data: {
                    client_id,
                    price: price,
                    date,
                    approval,
                }
            });
            return reply.status(200).send(invoice);
        }
    )
}