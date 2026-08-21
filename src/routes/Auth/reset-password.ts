import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import bcrypt from "bcrypt";

export const ResetPassword = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/auth/reset-password', {
    schema: {
      body: z.object({
        email: z.string().email(),
        token: z.string(),
        newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
      }),
    },
  }, async (request, reply) => {
    const { email, token, newPassword } = request.body;

    try {
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.status(400).send({ error: "Token inválido ou expirado" });
      }

      const resetData = await prisma.system_config.findUnique({
        where: { key: `reset_${user.id_user}` },
      });

      if (!resetData) {
        return reply.status(400).send({ error: "Token inválido ou expirado" });
      }

      const { token: storedToken, expiry } = resetData.value as any;

      if (token !== storedToken) {
        return reply.status(400).send({ error: "Token inválido" });
      }

      if (new Date(expiry) < new Date()) {
        return reply.status(400).send({ error: "Token expirado. Solicite novamente." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.users.update({
        where: { id_user: user.id_user },
        data: { senha: hashedPassword },
      });

      await prisma.system_config.delete({
        where: { key: `reset_${user.id_user}` },
      });

      return reply.send({ message: "Senha redefinida com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      return reply.status(500).send({ error: "Erro ao redefinir senha" });
    }
  });
};