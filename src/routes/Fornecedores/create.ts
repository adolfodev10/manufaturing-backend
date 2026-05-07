import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const CreateFornecedor = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/fornecedor/create", {
        schema: {
            body: z.object({
                nome: z.string().min(1, "Nome é obrigatório"),
                email: z.string().email("Email inválido"),
                telefone: z.string().min(1, "Telefone é obrigatório"),
                endereco: z.string().optional(),
                contato: z.string().optional(),
                nif: z.string().optional(),
                prazo_pagamento: z.number().int().min(0).optional().default(30),
            }),
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { 
                nome, 
                email, 
                telefone, 
                endereco, 
                nif, 
                prazo_pagamento, 
            } = req.body;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                // Verificar se já existe fornecedor com mesmo email
                const existingEmail = await prisma.fornecedores.findUnique({
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
                    const existingNif = await prisma.fornecedores.findUnique({
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
                const fornecedor = await prisma.fornecedores.create({
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

                await logger.success({
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
            } catch (error) {
                const duration = Date.now() - startTime;
                await logger.error({
                    action: "Criar Fornecedor",
                    user,
                    user_id: userId,
                    details: `Erro ao criar fornecedor: ${(error as Error).message}`,
                    ip,
                    resource: "fornecedores",
                    duration,
                });
                
                console.error("Erro ao criar fornecedor:", error);
                return reply.status(500).send({ 
                    success: false,
                    message: "Erro interno ao criar fornecedor",
                    error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
                });
            }
        }
    );
};