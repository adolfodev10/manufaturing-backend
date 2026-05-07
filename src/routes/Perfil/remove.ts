import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const RemoverPerfilUsuario = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/perfis/remover", {
        schema: {
            body: z.object({
                usuario_id: z.string().uuid(),
                perfil_id: z.string().uuid(),
            }),
        },
    },
        async (req, reply) => {
            try {
                const { usuario_id, perfil_id } = req.body;

                // Verificar se a atribuição existe
                const userPerfil = await prisma.userPerfil.findUnique({
                    where: {
                        user_id_perfil_id: {
                            user_id: usuario_id,
                            perfil_id: perfil_id,
                        }
                    }
                });

                if (!userPerfil) {
                    return reply.status(404).send({ 
                        error: "Atribuição não encontrada" 
                    });
                }

                // Verificar se o perfil é do sistema (não pode remover de último admin)
                const perfil = await prisma.perfil.findUnique({
                    where: { id: perfil_id }
                });

                if (perfil?.is_system) {
                    const countAdmins = await prisma.userPerfil.count({
                        where: { perfil_id }
                    });

                    if (countAdmins <= 1) {
                        return reply.status(403).send({ 
                            error: "Não é possível remover o último administrador do sistema" 
                        });
                    }
                }

                await prisma.userPerfil.delete({
                    where: {
                        user_id_perfil_id: {
                            user_id: usuario_id,
                            perfil_id: perfil_id,
                        }
                    }
                });

                // Atualizar contador de usuários no perfil
                const count = await prisma.userPerfil.count({
                    where: { perfil_id }
                });

                await prisma.perfil.update({
                    where: { id: perfil_id },
                    data: { usuarios_count: count }
                });

                return reply.status(204).send();

            } catch (error) {
                console.error("Erro ao remover perfil:", error);
                return reply.status(500).send({ error: "Erro ao remover perfil" });
            }
        }
    );
};