"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFornecedor = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const UpdateFornecedor = async (app) => {
    app.withTypeProvider().put("/fornecedor/update/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid("ID inválido"),
            }),
            body: zod_1.default.object({
                nome: zod_1.default.string().min(1).optional(),
                email: zod_1.default.string().email("Email inválido").optional(),
                telefone: zod_1.default.string().optional(),
                endereco: zod_1.default.string().optional().nullable(),
                nif: zod_1.default.string().optional().nullable(),
                prazo_pagamento: zod_1.default.number().int().min(0).optional(),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id } = req.params;
        const updateData = req.body;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            // Verificar se fornecedor existe
            const existingFornecedor = await prismaclient_1.prisma.fornecedores.findUnique({
                where: { id }
            });
            if (!existingFornecedor) {
                return reply.status(404).send({
                    success: false,
                    message: "Fornecedor não encontrado"
                });
            }
            // Verificar se email já existe (se estiver sendo alterado)
            if (updateData.email && updateData.email !== existingFornecedor.email) {
                const emailExists = await prismaclient_1.prisma.fornecedores.findUnique({
                    where: { email: updateData.email }
                });
                if (emailExists) {
                    return reply.status(400).send({
                        success: false,
                        message: "Já existe um fornecedor com este email",
                        field: "email"
                    });
                }
            }
            // Verificar se NIF já existe (se estiver sendo alterado)
            if (updateData.nif && updateData.nif !== existingFornecedor.nif) {
                const nifExists = await prismaclient_1.prisma.fornecedores.findUnique({
                    where: { nif: updateData.nif }
                });
                if (nifExists) {
                    return reply.status(400).send({
                        success: false,
                        message: "Já existe um fornecedor com este NIF",
                        field: "nif"
                    });
                }
            }
            const fornecedor = await prismaclient_1.prisma.fornecedores.update({
                where: { id },
                data: updateData,
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Atualizar Fornecedor",
                user,
                user_id: userId,
                details: `Fornecedor ${fornecedor.nome} atualizado com sucesso`,
                ip,
                resource: "fornecedores",
                resource_id: id,
                duration,
            });
            return reply.status(200).send({
                success: true,
                message: "Fornecedor atualizado com sucesso",
                data: fornecedor,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Atualizar Fornecedor",
                user,
                user_id: userId,
                details: `Erro ao atualizar fornecedor: ${error.message}`,
                ip,
                resource: "fornecedores",
                resource_id: id,
                duration,
            });
            return reply.status(500).send({
                success: false,
                message: "Erro ao atualizar fornecedor"
            });
        }
    });
};
exports.UpdateFornecedor = UpdateFornecedor;
