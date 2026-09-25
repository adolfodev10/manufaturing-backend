import { prisma } from "../../lib/prismaclient";
import { CreateCaixaInput, FecharCaixaInput } from "../../modules/validations/caixa/caixa.schema";

export async function abrirCaixa(data: CreateCaixaInput) {
  const caixaAberta = await prisma.caixa.findFirst({
    where: {
      operador_id: data.operador_id,
      status: "ABERTA",
    },
  });

  if (caixaAberta) {
    throw new Error("Já existe um caixa aberto para este operador.");
  }

  return prisma.caixa.create({
    data: {
      operador: data.operador,
      operador_id: data.operador_id,
      status: "ABERTA",
      valorInicial: data.valorInicial,
      observacoes: data.observacoes,
    },
  });
}


export async function getCaixaAberto(operadorId: string) {
  return prisma.caixa.findFirst({
    where: { operador_id: operadorId, status: "ABERTA" },
    include: {
      faturas: {
        orderBy: { dataEmissao: "desc" },
      },
    },
  });
}


export async function calcularResumoCaixa(caixaId: string) {
  const caixa = await prisma.caixa.findUnique({
    where: { id: caixaId },
    include: { faturas: true },
  });

  if (!caixa) throw new Error("Caixa não encontrado.");

  let totalDinheiro = 0;
  let totalTPA = 0;
  let totalMisto = 0;

  for (const f of caixa.faturas) {
    const fp = f.formaPagamento || "";
    if (fp === "CACHE" || fp === "Numerário") {
      totalDinheiro += f.totalPagar;
    } else if (fp === "TPA") {
      totalTPA += f.totalPagar;
    } else if (fp === "MISTO") {
      totalMisto += f.totalPagar;
    }
  }

  const totalVendas = caixa.faturas.reduce((s, f) => s + f.totalPagar, 0);
  const valorInicial = caixa.valorInicial ?? 0;

  return {
    valorInicial,
    totalVendas,
    totalDinheiro,
    totalTPA,
    totalMisto,
    totalFaturas: caixa.faturas.length,
    saldoFinal: valorInicial + totalDinheiro,
  };
}

export async function fecharCaixa(data: FecharCaixaInput) {
  const resumo = await calcularResumoCaixa(data.caixaId);

  return prisma.caixa.update({
    where: { id: data.caixaId },
    data: {
      status: "FECHADA",
      data_fechadura: new Date(),
      valorFinal: data.valorFinal ?? resumo.saldoFinal,
      totalVendas: resumo.totalVendas,
      totalDinheiro: resumo.totalDinheiro,
      totalTPA: resumo.totalTPA,
      totalFaturas: resumo.totalFaturas,
      observacoes: data.observacoes,
    },
  });
}

/**
 * Lista todos os caixas (para admin), com filtros opcionais.
 */
export async function listarCaixas(filtros?: {
  operadorId?: string;
  status?: "ABERTA" | "FECHADA";
}) {
  return prisma.caixa.findMany({
    where: {
      ...(filtros?.operadorId && { operador_id: filtros.operadorId }),
      ...(filtros?.status && { status: filtros.status }),
    },
    include: {
      _count: { select: { faturas: true } },
    },
    orderBy: { data_abertura: "desc" },
  });
}