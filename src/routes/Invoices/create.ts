import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { createInvoiceSchema } from "../../modules/validations/invoices/create-invoice-schema";

export const CreateInvoice = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/invoice/create", {
        schema: {
            body: createInvoiceSchema
        },
    },
        async (req, reply) => {
            const { id_invoice, client_id, product_id = "", price, date, approval = 'NAO_PAGAS' } = req.body;

            const data: any = {
                id_invoice,
                client_id,
                price,
                date,
                approval: 'NAO_PAGAS',
                updated_at: new Date(),
            };
            
            if (product_id) {
                data.product_id = product_id;
            }
            
            const invoice = await prisma.invoices.create({ data })
            return reply.code(201).send({ invoice });
        }
    )
}