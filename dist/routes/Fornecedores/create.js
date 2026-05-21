"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFornecedor = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const CreateFornecedor = async (app) => {
    app.withTypeProvider().post("/fornecedor/create", {
        schema: {
            body: zod_1.default.object({
                nome: zod_1.default.string().min(1, "Nome é obrigatório"),
                email: zod_1.default.string().email("Email inválido"),
                telefone: zod_1.default.string().min(1, "Telefone é obrigatório"),
                endereco: zod_1.default.string().optional(),
                contato: zod_1.default.string().optional(),
                nif: zod_1.default.string().optional(),
                prazo_pagamento: zod_1.default.number().int().min(0).optional().default(30),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { nome, email, telefone, endereco, nif, prazo_pagamento, } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            // Verificar se já existe fornecedor com mesmo email
            const existingEmail = await prismaclient_1.prisma.fornecedores.findUnique({
                where: { email }
            });
            if (existingEmail) {
                return reply.status(400).send({
                    message: "Já existe um fornecedor com este email",
                    field: "email"
                });
            }
            // Verificar se já existe fornecedor com mesmo NIF (se fornecido)
            if (nif) {
                const existingNif = await prismaclient_1.prisma.fornecedores.findUnique({
                    where: { nif }
                });
                if (existingNif) {
                    return reply.status(400).send({
                        message: "Já existe um fornecedor com este NIF",
                        field: "nif"
                    });
                }
            }
            // Criar fornecedor
            const fornecedor = await prismaclient_1.prisma.fornecedores.create({
                data: {
                    nome,
                    email,
                    telefone,
                    endereco: endereco || null,
                    nif: nif || null,
                    prazo_pagamento: prazo_pagamento || 30,
                },
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Criar Fornecedor",
                user,
                user_id: userId,
                details: `Fornecedor ${fornecedor.nome} criado com sucesso. ID: ${fornecedor.id}`,
                ip,
                resource: "fornecedores",
                resource_id: fornecedor.id,
                duration,
            });
            return reply.status(201).send({
                success: true,
                message: "Fornecedor criado com sucesso",
                data: fornecedor
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Criar Fornecedor",
                user,
                user_id: userId,
                details: `Erro ao criar fornecedor: ${error.message}`,
                ip,
                resource: "fornecedores",
                duration,
            });
            console.error("Erro ao criar fornecedor:", error);
            return reply.status(500).send({
                success: false,
                message: "Erro interno ao criar fornecedor",
                error: process.env.NODE_ENV === "development" ? error.message : undefined
            });
        }
    });
};
exports.CreateFornecedor = CreateFornecedor;
