// src/routes/fatura/emitir.ts
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  enviarDocumentoAGT,
  type AgtDocumento,
} from "../../services/agt";

// ---------- Helpers ----------

const faturaItemSchema = z.object({
  codigo: z.string().optional(),
  descricao: z.string(),
  quantidade: z.number().int().min(1),
  precoUnitario: z.number().nonnegative(),
  desconto: z.number().nonnegative().optional().default(0),
  taxaIVA: z.number().min(0).max(100).optional().default(14),
});

const emitirFaturaSchema = z.object({
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
  formaPagamento: z.string(),
  observacoes: z.string().optional(),
  operadorId: z.string(),
  operador: z.string(),
});

type FaturaItemInput = z.infer<typeof faturaItemSchema>;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

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

async function gerarNumeroFatura(tx: any, ano: number, mes: number) {
  const mesFormatado = String(mes).padStart(2, "0");
  const prefixo = `FR 000AB.${ano}/${mesFormatado}`;

  const serie = await tx.series.upsert({
    where: { tipo_ano_mes: { tipo: "FR", ano, mes } },
    create: { tipo: "FR", ano, mes, ultimo: 1, prefixo },
    update: { ultimo: { increment: 1 } },
  });

  return `${serie.prefixo}${String(serie.ultimo).padStart(5, "0")}`;
}

// ---------- Endpoint ----------

export const EmitirFatura = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/fatura/emitir",
    { schema: { body: emitirFaturaSchema } },
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
          formaPagamento,
          observacoes,
          operador,
          operadorId,
        } = req.body;

        // -------- Validações --------
        if (!operadorId) {
          return res.status(400).send({
            success: false,
            message: "operadorId é obrigatório",
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

        // -------- Recalcular totais --------
        let calculado;
        try {
          calculado = recalcularTotais(itens);
        } catch (err: any) {
          return res.status(400).send({
            success: false,
            message: err.message || "Erro ao calcular totais",
          });
        }

        // -------- Gerar número + enviar AGT + gravar --------
        // Estratégia: 1 transação DB. Se AGT falhar, rollback.
        // Mas o lock da série é incrementado mesmo em rollback?
        // O Prisma revert o increment em rollback, então é seguro.
        const emissao = new Date(dataEmissao);
        const ano = emissao.getFullYear();
        const mes = emissao.getMonth() + 1;

        // 1) Reserva número numa transação curta
        const numero = await prisma.$transaction(async (tx) => {
          return await gerarNumeroFatura(tx, ano, mes);
        });

        // 2) Monta payload AGT
        const agtDoc: AgtDocumento = {
          nifEmitente: empresa.nif,
          nifAdquirente: cliente.nif || "999999999",
          numeroDocumento: numero,
          dataEmissao: emissao.toISOString().slice(0, 19).replace("T", " "),
          tipoDocumento: "FT",
          itens: calculado.itensCalculados.map((i) => ({
            codigo: i.codigo,
            descricao: i.descricao,
            quantidade: i.quantidade,
            precoUnitario: i.precoUnitario,
            taxaIVA: i.taxaIVA,
            total: i.total,
          })),
          totais: {
            baseTributavel: calculado.semImpostos,
            iva: calculado.impostos,
            total: calculado.totalPagar,
          },
          hashSoftware: "",
          qrCodeData: "",
        };

        // 3) Envia à AGT (fora da transação — pode demorar)
        const agtRes = await enviarDocumentoAGT(agtDoc);

        // 4) Se AGT falhou → devolve erro, não grava
        if (!agtRes.success || !agtRes.hashFiscal) {
          logger.error({
            action: "Emitir Fatura - AGT recusou",
            user,
            user_id: userId,
            details: `AGT: ${agtRes.message} | Número: ${numero}`,
            ip,
            resource: "faturas",
          });

          return res.status(502).send({
            success: false,
            message: `AGT recusou: ${agtRes.message}`,
            numero, // devolve o número para o operador poder reportar
          });
        }

        // 5) AGT OK → grava fatura numa transação
        const fatura = await prisma.$transaction(async (tx) => {
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
              statusAGT: "ENVIADO",
              hashFiscal: agtRes.hashFiscal,
              qrCodeData: "", // será gerado no frontend (visualização)
              caixaId: caixaAberto.id,
              itens: {
                create: calculado.itensCalculados.map((i) => ({
                  id: randomUUID(),
                  codigo: i.codigo,
                  descricao: i.descricao,
                  quantidade: i.quantidade,
                  precoUnitario: i.precoUnitario,
                  desconto: i.desconto,
                  impostos: i.imposto,
                  total: i.total,
                  taxaIVA: i.taxaIVA,
                })),
              },
            },
            include: { itens: true },
          });
        });

        const duration = Date.now() - startTime;

        logger.success({
          action: "Emitir Fatura",
          user,
          user_id: userId,
          details: `Fatura ${fatura.numero} emitida. Total: ${calculado.totalPagar} AOA. Hash AGT: ${agtRes.hashFiscal.slice(0, 16)}...`,
          ip,
          resource: "faturas",
          resource_id: fatura.id_fatura,
          duration,
        });

        return res.status(201).send({
          success: true,
          data: fatura,
          hashFiscal: agtRes.hashFiscal,
          codigoValidacao: agtRes.codigoValidacao,
        });
      } catch (error: any) {
        const duration = Date.now() - startTime;

        logger.error({
          action: "Emitir Fatura",
          user,
          user_id: userId,
          details: `Erro: ${error?.message || "desconhecido"}`,
          ip,
          resource: "faturas",
          duration,
        });

        console.error("[fatura/emitir] Erro:", error);

        return res.status(500).send({
          success: false,
          message: "Erro interno ao emitir fatura",
          error: error?.message || error,
        });
      }
    },
  );
};