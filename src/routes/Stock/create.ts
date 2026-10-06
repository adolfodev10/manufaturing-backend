import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createEstoqueSchema } from "../../modules/validations/product/create-product";
import { prisma } from "../../lib/prismaclient";
import { randomUUID } from "crypto";

export const CreateStockProduct = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/stock/create",
    {
      schema: { body: createEstoqueSchema },
    },
    async (request, reply) => {
      const {
        name,
        price,
        categoriaId,
        quantity,
        preco_compra,
        category,
        date_validate,
      } = request.body;

      const productExists = await prisma.estoque.findFirst({
        where: { name: { equals: name ?? "" } },
      });

      if (productExists) {
        return reply
          .status(400)
          .send({ error: "Já existe um produto com este nome" });
      }

      const products = await prisma.estoque.create({
        data: {
          name: name ?? "",
          price: Number(price),
          preco_compra: preco_compra != null ? String(preco_compra) : null,
          category,
          categoriaId: categoriaId ?? null,
          date_validate: date_validate
            ? new Date(date_validate).toISOString()
            : "",
          quantity: Number(quantity),
          updated_at: new Date(),
          id_estoque: randomUUID(),
        },
      });

      return reply.code(201).send({ products });
    }
  );
};