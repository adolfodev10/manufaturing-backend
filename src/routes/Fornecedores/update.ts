import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const UpdateFornecedor = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put("/fornecedor/update/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid("ID inválido"),
            }),
            body: z.object({
                nome: z.string().min(1).optional(),
                email: z.string().email("Email inválido").optional(),
                telefone: z.string().optional(),
                endereco: z.string().optional().nullable(),
                nif: z.string().optional().nullable(),
                prazo_pagamento: z.number().int().min(0).optional(),
            }),
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { id } = req.params as { id: string };
            const updateData = req.body;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                // Verificar se fornecedor existe
                const existingFornecedor = await prisma.fornecedores.findUnique({
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
                    const emailExists = await prisma.fornecedores.findUnique({
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
                    const nifExists = await prisma.fornecedores.findUnique({
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

                const fornecedor = await prisma.fornecedores.update({
                    where: { id },
                    data: updateData,
                });

                const duration = Date.now() - startTime;

                await logger.success({
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
            } catch (error) {
                const duration = Date.now() - startTime;
                await logger.error({
                    action: "Atualizar Fornecedor",
                    user,
                    user_id: userId,
                    details: `Erro ao atualizar fornecedor: ${(error as Error).message}`,
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
        }
    );
};