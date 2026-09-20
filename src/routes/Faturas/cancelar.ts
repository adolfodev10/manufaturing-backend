import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

async function enviarDocumentoAGT(_payload: any): Promise<void> {
    return;
}


export const CancelarFatura = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/fatura/cancelar",
        {
            schema: {
                body: z.object({
                    faturaId: z.string().uuid("ID de fatura inválido"),
                    motivo: z
                        .string()
                        .min(3, "Motivo deve ter pelo menos 3 caracteres")
                        .max(500, "Motivo muito longo"),
                }),
            },
        },

        async (request, reply) => {
            try {
                const { faturaId, motivo } = request.body;
                const user = (request as any).user;

                // 1. Permissão
                if (
                    user?.role !== "ADMINISTRADOR" &&
                    user?.role !== "GERENTE" &&
                    user?.role !== "ADMIN"
                ) {
                    return reply.status(403).send({
                        error: "Apenas administradores podem cancelar faturas",
                    });
                }
                const userDb = user?.id_user ?
                    await prisma.users.findUnique({
                        where: { id_user: user?.id_user },
                        select: { name: true },
                    }) : null;

                // 2. Buscar fatura original com itens
                const faturaOriginal = await prisma.faturas.findUnique({
                    where: { id_fatura: faturaId },
                    include: { itens: true },
                });

                if (!faturaOriginal) {
                    return reply.status(404).send({
                        error: "Fatura não encontrada",
                    });
                }

                if (faturaOriginal.status === "CANCELADA") {
                    return reply.status(400).send({
                        error: "Esta fatura já está cancelada",
                    });
                }

                if (faturaOriginal.numero.startsWith("NC ")) {
                    return reply.status(400).send({
                        error: "Não é possível cancelar uma Nota de Crédito",
                    });
                }

                // 3. Gerar número sequencial da NC
                const anoAtual = new Date().getFullYear();
                const ultimaNC = await prisma.faturas.findFirst({
                    where: {
                        numero: { startsWith: `NC ${anoAtual}/` },
                    },
                    orderBy: { numero: "desc" },
                });

                let proximoNumero = 1;
                if (ultimaNC) {
                    const partes = ultimaNC.numero.split("/");
                    const ultimoSeq = parseInt(partes[1] ?? "0", 10);
                    if (!isNaN(ultimoSeq)) proximoNumero = ultimoSeq + 1;
                }
                const numeroNC = `NC ${anoAtual}/${String(proximoNumero).padStart(4, "0")}`;

                // 4. Criar NC + marcar original numa transação
                const resultado = await prisma.$transaction(async (tx) => {
                    // 4a. Marcar original como CANCELADA
                    await tx.faturas.update({
                        where: { id_fatura: faturaId },
                        data: {
                            status: "CANCELADA",
                            observacoes: `Cancelada em ${new Date().toISOString()} por ${user?.email ?? "Sistema"
                                }. Motivo: ${motivo}. NC emitida: ${numeroNC}`,
                            updated_at: new Date(),
                        },
                    });


                    // 4b. Criar NC com valores negativos
                    const notaCredito = await tx.faturas.create({
                        data: {
                            numero: numeroNC,
                            dataEmissao: new Date(),

                            clienteNome: faturaOriginal.clienteNome,
                            clienteNIF: faturaOriginal.clienteNIF,
                            clienteEndereco: faturaOriginal.clienteEndereco,
                            clienteTelefone: faturaOriginal.clienteTelefone,
                            clienteEmail: faturaOriginal.clienteEmail,
                            clienteCodigo: faturaOriginal.clienteCodigo,

                            empresaNome: faturaOriginal.empresaNome,
                            empresaNIF: faturaOriginal.empresaNIF,
                            empresaEndereco: faturaOriginal.empresaEndereco,
                            empresaTelefone: faturaOriginal.empresaTelefone,
                            empresaEmail: faturaOriginal.empresaEmail,

                            // Valores negativos (NC abate a fatura original)
                            subtotal: -Math.abs(faturaOriginal.subtotal ?? 0),
                            impostos: -Math.abs(faturaOriginal.impostos ?? 0),
                            descontos: 0,
                            totalPagar: -Math.abs(faturaOriginal.totalPagar ?? 0),

                            operador: userDb?.name ?? user?.email ?? "Sistema",
                            operadorId: user?.id_user ?? null,

                            formaPagamento: faturaOriginal.formaPagamento ?? "CACHE",
                            observacoes: `Anula a fatura ${faturaOriginal.numero}. Motivo: ${motivo}`,

                            status: "EMITIDA",
                            statusAGT: "PENDENTE",

                            // Não vincula à mesma caixa para não confundir o saldo do turno
                            caixaId: null,

                            // Itens com valores negativos
                            itens: {
                                create: (faturaOriginal.itens ?? []).map((item: any) => {
                                    const valorItem = item.valor ?? item.total ?? 0;

                                    return {
                                        // Ajuste esses campos conforme o schema real do faturaItem
                                        codigo: item.codigo,
                                        descricao: item.descricao,
                                        quantidade: item.quantidade,
                                        precoUnitario: item.precoUnitario,
                                        desconto: 0,
                                        valor: -Math.abs(valorItem),
                                        impostos: -Math.abs(item.impostos ?? 0),
                                        total: -Math.abs(item.total ?? 0),
                                        taxaIVA: item.taxaIVA ?? 14,
                                    };
                                }),
                            },
                        },
                        include: { itens: true },
                    });

                    return { notaCredito };
                });

                // 5. Enviar NC para AGT (opcional — faça em background ou aqui)
                // Descomente se tiver a função:
                //
                try {
                    await enviarDocumentoAGT({
                        tipoDocumento: "NC",
                        numeroDocumento: numeroNC,
                        nifEmitente: faturaOriginal.empresaNIF ?? "",
                        nifAdquirente: faturaOriginal.clienteNIF ?? "999999999",
                        dataEmissao: new Date().toISOString(),
                        itens: resultado.notaCredito.itens,
                        totais: {
                            baseTributavel: resultado.notaCredito.subtotal,
                            iva: resultado.notaCredito.impostos,
                            total: resultado.notaCredito.totalPagar,
                        },
                        hashSoftware: "",
                        qrCodeData: "",
                    });
                } catch (err) {
                    console.error("[cancelar] AGT offline — NC guardada localmente:", err);
                }

                return reply.send({
                    success: true,
                    message: `Fatura ${faturaOriginal.numero} cancelada. Nota de Crédito ${numeroNC} emitida.`,
                    numero: numeroNC,
                    notaCredito: resultado.notaCredito,
                });
            } catch (error: any) {
                console.error("[fatura/cancelar] ERRO:", error);
                return reply.status(500).send({
                    error: error?.message || "Erro ao cancelar fatura",
                });
            }
        }
    );
};