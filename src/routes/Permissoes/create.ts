import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const CreatePermissao = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/permissoes", {
        schema: {
            body: z.object({
                nome: z.string(),
                descricao: z.string(),
                modulo: z.string(),
                acao: z.enum(["criar", "ler", "atualizar", "deletar", "exportar", "importar", "configurar"]),
                recurso: z.string(),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { nome, descricao, modulo, acao, recurso } = req.body;

                const permissao = await prisma.permissao.create({
                    data: {
                        nome,
                        descricao,
                        modulo,
                        acao,
                        recurso,
                    },
                });

                return reply.status(201).send(permissao);

            } catch (error) {
                console.error("Erro ao criar permissão:", error);
                return reply.status(500).send({ error: "Erro ao criar permissão" });
            }
        }
    );
};