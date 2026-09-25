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
  numero: z.string().optional(),
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
  observacoes: z.string().optional(),
  operador: z.string(),
  operadorId: z.string().optional(),
  hashFiscal: z.string().optional(),
  qrCodeData: z.string().optional(),
  statusAGT: z.string().optional().default("PENDENTE"),
});

async function gerarNumeroFatura(
  tx: any,
  ano: number,
  mes: number
): Promise<string> {
  const mesFormatado = String(mes).padStart(2, "0");
  const prefixo = `FR 000AB.${ano}/${mesFormatado}`;

  const ultima = await tx.faturas.findFirst({
    where: { numero: { startsWith: prefixo } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  let proximo = 1;
  if (ultima) {
    const match = ultima.numero.match(/(\d{5})$/);
    if (match) proximo = parseInt(match[1], 10) + 1;
  }

  return `${prefixo}${String(proximo).padStart(5, "0")}`;
}

export const CreateFatura = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/fatura/create",
    { schema: { body: createFaturaSchema } },
    async (req, res) => {
      const startTime = Date.now();
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const user = (req as any).user?.name || "sistema";
      const userId = (req as any).user?.id;

      try {
        const {
          dataEmissao,
          dataVencimento,
          cliente,
          empresa,
          itens,
          totais,
          formaPagamento,
          observacoes,
          operador,
          operadorId,
          hashFiscal,
          qrCodeData,
          statusAGT,
        } = req.body;

        if (!operadorId) {
          return res.status(400).send({
            success: false,
            message: "O ID do operador é obrigatório",
          });
        }

        const caixaAberto = await prisma.caixa.findFirst({
          where: { operador_id: operadorId, status: "ABERTA" },
        });

        if (!caixaAberto) {
          return res.status(400).send({
            success: false,
            message: "Não há caixa aberto. Abra um caixa antes de vender.",
          });
        }

        const fatura = await prisma.$transaction(async (tx) => {
          const emissao = new Date(dataEmissao);
          const numero = await gerarNumeroFatura(
            tx,
            emissao.getFullYear(),
            emissao.getMonth() + 1
          );

          return tx.faturas.create({
            data: {
              id_fatura: randomUUID(),
              numero,
              dataEmissao: emissao,
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
              operador,
              operadorId,
              formaPagamento,
              observacoes,
              status: "EMITIDA",
              statusAGT: statusAGT || "PENDENTE",
              hashFiscal,
              qrCodeData,
              caixaId: caixaAberto.id,
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
            include: { itens: true },
          });
        });

        const duration = Date.now() - startTime;

        logger.success({
          action: "Criar Fatura",
          user,
          user_id: userId,
          details: `Fatura criada: ${fatura.numero} - Total: ${totais.totalPagar} AOA`,
          ip,
          resource: "faturas",
          resource_id: fatura.id_fatura,
          new_value: JSON.stringify({
            numero: fatura.numero,
            totalPagar: totais.totalPagar,
          }),
          duration,
        });

        return res.status(201).send({ success: true, data: fatura });
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.error({
          action: "Criar Fatura",
          user,
          user_id: userId,
          details: `Erro ao criar fatura: ${error instanceof Error ? error.message : "Erro desconhecido"
            }`,
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