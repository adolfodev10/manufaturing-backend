import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import z from "zod";

const updateFaturaSchema = z.object({
  status: z.enum(["EMITIDA", "PAGA", "CANCELADA"]).optional(),
  statusAGT: z.enum(["PENDENTE", "ENVIADO", "ERRO"]).optional(),
  hashFiscal: z.string().optional(),
  qrCodeData: z.string().optional(),
  codigoValidacao: z.string().optional(),
});

export const UpdateFatura = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/fatura/:id",
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: updateFaturaSchema,
      },
    },
    async (req, res) => {
      const startTime = Date.now();
      const { id } = req.params;
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const user = (req as any).user?.name || "sistema";
      const userId = (req as any).user?.id;

      try {
        const faturaExistente = await prisma.faturas.findUnique({
          where: { id_fatura: id },
        });

        if (!faturaExistente) {
          return res.status(404).send({
            success: false,
            message: "Fatura não encontrada",
          });
        }

        const fatura = await prisma.faturas.update({
          where: { id_fatura: id },
          data: req.body,
          include: {
            itens: true,
          },
        });

        const duration = Date.now() - startTime;

        logger.success({
          action: "Atualizar Fatura",
          user,
          user_id: userId,
          details: `Fatura ${fatura.numero} atualizada`,
          ip,
          resource: "faturas",
          resource_id: id,
          old_value: JSON.stringify(faturaExistente),
          new_value: JSON.stringify(req.body),
          duration,
        });

        return res.status(200).send({
          success: true,
          data: fatura,
        });
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.error({
          action: "Atualizar Fatura",
          user,
          user_id: userId,
          details: `Erro ao atualizar fatura: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          ip,
          resource: "faturas",
          resource_id: id,
          duration,
        });

        return res.status(500).send({
          success: false,
          message: "Erro ao atualizar fatura",
        });
      }
    }
  );
};