"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFatura = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const crypto_1 = require("crypto");
const zod_1 = __importDefault(require("zod"));
const faturaItemSchema = zod_1.default.object({
    codigo: zod_1.default.string().optional(),
    descricao: zod_1.default.string(),
    quantidade: zod_1.default.number().int().min(1),
    precoUnitario: zod_1.default.number(),
    desconto: zod_1.default.number().optional().default(0),
    valor: zod_1.default.number(),
    imposto: zod_1.default.number(),
    total: zod_1.default.number(),
    taxaIVA: zod_1.default.number().optional().default(14),
});
const createFaturaSchema = zod_1.default.object({
    numero: zod_1.default.string(),
    dataEmissao: zod_1.default.string(),
    dataVencimento: zod_1.default.string().optional(),
    cliente: zod_1.default.object({
        nome: zod_1.default.string(),
        nif: zod_1.default.string().optional(),
        endereco: zod_1.default.string().optional(),
        telefone: zod_1.default.string().optional(),
        email: zod_1.default.string().optional(),
        codigoCliente: zod_1.default.string().optional(),
    }),
    empresa: zod_1.default.object({
        nome: zod_1.default.string(),
        nif: zod_1.default.string(),
        endereco: zod_1.default.string(),
        telefone: zod_1.default.string(),
        email: zod_1.default.string().optional(),
    }),
    itens: zod_1.default.array(faturaItemSchema),
    totais: zod_1.default.object({
        semImpostos: zod_1.default.number(),
        impostos: zod_1.default.number(),
        descontos: zod_1.default.number().optional().default(0),
        totalPagar: zod_1.default.number(),
    }),
    formaPagamento: zod_1.default.string(),
    operador: zod_1.default.string(),
    operadorId: zod_1.default.string().optional(),
    hashFiscal: zod_1.default.string().optional(),
    qrCodeData: zod_1.default.string().optional(),
    statusAGT: zod_1.default.string().optional().default("PENDENTE"),
});
const CreateFatura = async (app) => {
    app.withTypeProvider().post("/fatura/create", {
        schema: {
            body: createFaturaSchema,
        },
    }, async (req, res) => {
        const startTime = Date.now();
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.name || "sistema";
        const userId = req.user?.id;
        try {
            const { numero, dataEmissao, dataVencimento, cliente, empresa, itens, totais, operador, operadorId, hashFiscal, qrCodeData, statusAGT, } = req.body;
            // Verificar se já existe fatura com este número
            const existente = await prismaclient_1.prisma.faturas.findUnique({
                where: { numero },
            });
            if (existente) {
                return res.status(409).send({
                    success: false,
                    message: "Já existe uma fatura com este número",
                });
            }
            const fatura = await prismaclient_1.prisma.faturas.create({
                data: {
                    id_fatura: (0, crypto_1.randomUUID)(),
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
                    operador,
                    operadorId,
                    status: "EMITIDA",
                    statusAGT: statusAGT || "PENDENTE",
                    hashFiscal,
                    qrCodeData,
                    itens: {
                        create: itens.map((item) => ({
                            id: (0, crypto_1.randomUUID)(),
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
            logger_1.logger.success({
                action: "Criar Fatura",
                user,
                user_id: userId,
                details: `Fatura criada: ${numero} - Total: ${totais.totalPagar} AOA`,
                ip,
                resource: "faturas",
                resource_id: fatura.id_fatura,
                new_value: JSON.stringify({ numero, totalPagar: totais.totalPagar }),
                duration,
            });
            return res.status(201).send({
                success: true,
                data: fatura,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.logger.error({
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
    });
};
exports.CreateFatura = CreateFatura;
