import { FastifyInstance } from "fastify";
import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { prisma } from "../../lib/prismaclient";

export const DeleteInvoice = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete('/invoice/delete/:id', {
        schema: {
            params: z.object({
                id: z.string().nonempty("O campo id é obrigatório."),
            }),
        },
    },
        async (req, res) => {
            const { id } = req.params;

            const invoice = await prisma.invoices.findUnique({
                where: { id_invoice: id },
            });

            if (!invoice) {
                return res.status(404).send({ message: 'Dívida não encontrado' });
            }
            await prisma.invoices.delete({
                where: {
                    id_invoice: id,
                },
            });

            return res.status(200).send({ message: "Dívida eliminada com sucesso" });
        }
    );
}
