import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const CreatePedidoCompra = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/fornecedores/pedido', {
    schema: {
      body: z.object({
        fornecedor_id: z.string(),
        data_entrega: z.string().optional(),
        itens: z.array(z.object({
          materia_prima_id: z.string(),
          quantidade: z.number(),
          preco_unitario: z.number(),
        })),
      }),
    },
  }, async (request, reply) => {
    const { fornecedor_id, data_entrega, itens } = request.body;

    try {
      const valor_total = itens.reduce((sum, item) => 
        sum + (item.quantidade * item.preco_unitario), 0
      );

      const compra = await prisma.compras.create({
        data: {
          fornecedor_id,
          data_entrega: data_entrega ? new Date(data_entrega) : null,
          valor_total,
        },
      });

      return reply.status(201).send(compra);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};