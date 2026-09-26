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
  precoUnitario: z.number().nonnegative(),
  desconto: z.number().nonnegative().optional().default(0),
  valor: z.number(),
  imposto: z.number(),
  total: z.number(),
  taxaIVA: z.number().min(0).max(100).optional().default(14),
});

const createFaturaSchema = z.object({
  numero: z.string().optional(),
  dataEmissao: z.string(),
  dataVencimento: z.string().optional(),
  cliente: z.object({
    nome: z.string().min(1),
    nif: z.string().optional(),
    endereco: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().optional(),
    codigoCliente: z.string().optional(),
  }),
  empresa: z.object({
    nome: z.string().min(1),
    nif: z.string().min(1),
    endereco: z.string(),
    telefone: z.string(),
    email: z.string().optional(),
  }),
  itens: z.array(faturaItemSchema).min(1),
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

type FaturaItemInput = z.infer<typeof faturaItemSchema>;

function recalcularTotais(itens: FaturaItemInput[]) {
  let semImpostos = 0;
  let impostos = 0;
  let descontos = 0;

  const itensCalculados = itens.map((item) => {
    const bruto = item.quantidade * item.precoUnitario;
    const desconto = item.desconto ?? 0;

    if (desconto > bruto) {
      throw new Error(
        `Desconto (${desconto}) maior que o valor bruto (${bruto}) no item "${item.descricao}"`,
      );
    }

    const valor = bruto - desconto;
    const taxa = item.taxaIVA ?? 14;
    const imposto = round2(valor * (taxa / 100));
    const total = round2(valor + imposto);

    semImpostos += valor;
    impostos += imposto;
    descontos += desconto;

    return {
      codigo: item.codigo || "-",
      descricao: item.descricao,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      desconto,
      valor: round2(valor),
      imposto,
      total,
      taxaIVA: taxa,
    };
  });

  return {
    itensCalculados,
    semImpostos: round2(semImpostos),
    impostos: round2(impostos),
    descontos: round2(descontos),
    totalPagar: round2(semImpostos + impostos),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function totaisBatem(
  cliente: { semImpostos: number; impostos: number; descontos: number; totalPagar: number },
  calculado: { semImpostos: number; impostos: number; descontos: number; totalPagar: number },
): boolean {
  const TOL = 0.01;
  return (
    Math.abs(cliente.semImpostos - calculado.semImpostos) <= TOL &&
    Math.abs(cliente.impostos - calculado.impostos) <= TOL &&
    Math.abs((cliente.descontos ?? 0) - calculado.descontos) <= TOL &&
    Math.abs(cliente.totalPagar - calculado.totalPagar) <= TOL
  );
}



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
          totais: totaisCliente,
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

           let calculado;
        try {
          calculado = recalcularTotais(itens);
        } catch (err: any) {
          return res.status(400).send({
            success: false,
            message: err.message || "Erro ao calcular totais dos itens",
          });
        }

        if (!totaisBatem(totaisCliente, calculado)) {
          logger.error({
            action: "Criar Fatura - Totais divergentes",
            user,
            user_id: userId,
            details: `Totais do cliente: ${JSON.stringify(totaisCliente)} | Calculado: ${JSON.stringify({
              semImpostos: calculado.semImpostos,
              impostos: calculado.impostos,
              descontos: calculado.descontos,
              totalPagar: calculado.totalPagar,
            })}`,
            ip,
            resource: "faturas",
          });

           return res.status(400).send({
            success: false,
            message:
              "Os totais enviados não correspondem ao cálculo do servidor. Fatura recusada.",
            details: {
              cliente: totaisCliente,
              servidor: {
                semImpostos: calculado.semImpostos,
                impostos: calculado.impostos,
                descontos: calculado.descontos,
                totalPagar: calculado.totalPagar,
              },
            },
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

              subtotal: calculado.semImpostos,
              impostos: calculado.impostos,
              descontos: calculado.descontos,
              totalPagar: calculado.totalPagar,

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
                create: calculado.itensCalculados.map((item) => ({
                  id: randomUUID(),
                  codigo: item.codigo,
                  descricao: item.descricao,
                  quantidade: item.quantidade,
                  precoUnitario: item.precoUnitario,
                  desconto: item.desconto,
                  impostos: item.imposto,
                  total: item.total,
                  taxaIVA: item.taxaIVA,
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
          details: `Fatura criada: ${fatura.numero} - Total: ${calculado.totalPagar} AOA`,
          ip,
          resource: "faturas",
          resource_id: fatura.id_fatura,
          new_value: JSON.stringify({
            numero: fatura.numero,
            totalPagar: calculado.totalPagar,
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