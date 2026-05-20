import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { randomUUID } from "crypto";
import z from "zod";

const faturaItemSchema = z.object({
  codigo: z.string().optional(),
  descricao: z.string(),
  quantidade: z.number().int().min(1),
  precoUnitario: z.number(),
  desconto: z.number().optional().default(0),
  valor: z.number(),
  imposto: z.number(),
  total: z.number(),
  taxaIVA: z.number().optional().default(14),
});

const createFaturaSchema = z.object({
  numero: z.string(),
  dataEmissao: z.string(),
  dataVencimento: z.string().optional(),
  cliente: z.object({
    nome: z.string(),
    nif: z.string().optional(),
    endereco: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().optional(),
    codigoCliente: z.string().optional(),
  }),
  empresa: z.object({
    nome: z.string(),
    nif: z.string(),
    endereco: z.string(),
    telefone: z.string(),
    email: z.string().optional(),
  }),
  itens: z.array(faturaItemSchema),
  totais: z.object({
    semImpostos: z.number(),
    impostos: z.number(),
    descontos: z.number().optional().default(0),
    totalPagar: z.number(),
  }),
  formaPagamento: z.string(),
  operador: z.string(),
  operadorId: z.string().optional(),
  hashFiscal: z.string().optional(),
  qrCodeData: z.string().optional(),
  statusAGT: z.string().optional().default("PENDENTE"),
});

export const CreateFatura = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/fatura/create",
    {
      schema: {
        body: createFaturaSchema,
      },
    },
    async (req, res) => {
      const startTime = Date.now();
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const user = (req as any).user?.name || "sistema";
      const userId = (req as any).user?.id;

      try {
        const {
          numero,
          dataEmissao,
          dataVencimento,
          cliente,
          empresa,
          itens,
          totais,
          formaPagamento,
          operador,
          operadorId,
          hashFiscal,
          qrCodeData,
          statusAGT,
        } = req.body;

        // Verificar se já existe fatura com este número
        const existente = await prisma.faturas.findUnique({
          where: { numero },
        });

        if (existente) {
          return res.status(409).send({
            success: false,
            message: "Já existe uma fatura com este número",
          });
        }

        const fatura = await prisma.faturas.create({
          data: {
            id_fatura: randomUUID(),
            numero,
            dataEmissao: new Date(dataEmissao),
            dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
            clienteNome: cliente.nome,
            clienteNIF: cliente.nif,
            clienteEndereco: cliente.endereco,
            clienteTelefone: cliente.telefone,
            clienteEmail: cliente.email,
            clienteCodigo: cliente.codigoCliente,
            empresaNome: empresa.nome,
            empresaNIF: empresa.nif,
            empresaEndereco: empresa.endereco,
            empresaTelefone: empresa.telefone,
            empresaEmail: empresa.email,
            subtotal: totais.semImpostos,
            impostos: totais.impostos,
            descontos: totais.descontos || 0,
            totalPagar: totais.totalPagar,
            formaPagamento: formaPagamento,
            operador,
            operadorId,
            status: "EMITIDA",
            statusAGT: statusAGT || "PENDENTE",
            hashFiscal,
            qrCodeData,
            itens: {
              create: itens.map((item) => ({
                id: randomUUID(),
                codigo: item.codigo || "-",
                descricao: item.descricao,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
                desconto: item.desconto || 0,
                impostos: item.imposto,
                total: item.total,
                taxaIVA: item.taxaIVA || 14,
              })),
            },
          },
          include: {
            itens: true,
          },
        });

        const duration = Date.now() - startTime;

        logger.logSync({
          level: "SUCCESS",
          action: "Criar Fatura",
          user,
          user_id: userId,
          details: `Fatura criada: ${numero} - Total: ${totais.totalPagar} AOA`,
          ip,
          resource: "faturas",
          resource_id: fatura.id_fatura,
          new_value: JSON.stringify({ numero, totalPagar: totais.totalPagar, formaPagamento }),
          duration,
        });

        return res.status(201).send({
          success: true,
          data: fatura,
        });
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.logSync({
          level: "ERROR",
          action: "Criar Fatura",
          user,
          user_id: userId,
          details: `Erro ao criar fatura: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          ip,
          resource: "faturas",
          duration,
          old_value: JSON.stringify(req.body),
        });

        console.error("Erro ao criar fatura:", error);
        return res.status(500).send({
          success: false,
          message: "Erro interno ao criar fatura",
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  );
};