import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";

export const GetProximoNumero = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/fatura/proximo-numero",
    {
      schema: {
        querystring: z.object({
          ano: z.coerce.number().int().optional(),
          mes: z.coerce.number().int().min(1).max(12).optional(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const hoje = new Date();
        const ano = request.query.ano ?? hoje.getFullYear();
        const mes = request.query.mes ?? hoje.getMonth() + 1;

        const mesFormatado = mes.toString().padStart(2, "0");
        const prefixo = `FR 000AB.${ano}/${mesFormatado}`;

        const ultimaFatura = await prisma.faturas.findFirst({
          where: {
            numero: { startsWith: prefixo },
          },
          orderBy: { numero: "desc" },
          select: { numero: true },
        });

        let proximo = 1;
        if (ultimaFatura) {
          const match = ultimaFatura.numero.match(/(\d{5})$/);
          if (match) {
            proximo = parseInt(match[1], 10) + 1;
          }
        }

        const numeroSequencial = proximo.toString().padStart(5, "0");
        const numeroCompleto = `${prefixo}${numeroSequencial}`;

        return reply.status(200).send({
          success: true,
          numero: numeroCompleto,
          prefixo,
          sequencial: proximo,
        });
      } catch (error) {
        console.error("Erro ao gerar próximo número:", error);
        return reply.status(500).send({
          success: false,
          message: "Erro ao gerar próximo número de fatura",
        });
      }
    }
  );
};