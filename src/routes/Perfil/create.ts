import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const CreatePerfil = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/perfis", {
        schema: {
            body: z.object({
                nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
                descricao: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
                nivel: z.number().int().min(1).max(5).default(1),
                permissoes: z.array(z.string().uuid()).default([]),
                is_default: z.boolean().default(false),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { nome, descricao, nivel, permissoes, is_default } = req.body;

                // Verificar se já existe um perfil com o mesmo nome
                const perfilExistente = await prisma.perfil.findUnique({
                    where: { nome },
                });

                if (perfilExistente) {
                    return reply.status(400).send({ error: "Já existe um perfil com este nome" });
                }

                // Se for perfil padrão, remover padrão de outros perfis
                if (is_default) {
                    await prisma.perfil.updateMany({
                        where: { is_default: true },
                        data: { is_default: false },
                    });
                }

                const perfil = await prisma.perfil.create({
                    data: {
                        nome,
                        descricao,
                        nivel,
                        permissoes: JSON.stringify(permissoes),
                        is_default,
                        usuarios_count: 0,
                    },
                });

                return reply.status(201).send({
                    ...perfil,
                    permissoes: JSON.parse(perfil.permissoes)
                });

            } catch (error) {
                console.error("Erro ao criar perfil:", error);
                return reply.status(500).send({ error: "Erro ao criar perfil" });
            }
        }
    );
};