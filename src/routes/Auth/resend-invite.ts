import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";
import { randomBytes } from "crypto";
import { hash } from "bcrypt";
import { sendWelcomeEmail } from "../../lib/mailer";

export const ResendInvite = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/user/resendInvite/:id",
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    async (req, reply) => {
      const { id } = req.params;

      const requester = (req as any).user as
        | { id_user?: string; role?: string }
        | undefined;

      if (!requester?.id_user) {
        return reply.status(401).send({ message: "Não autenticado." });
      }

      if (requester.role !== "ADMINISTRADOR") {
        return reply.status(403).send({
          message: "Apenas administradores podem reenviar convites.",
        });
      }

      const user = await prisma.users.findUnique({ where: { id_user: id } });

      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado." });
      }

      if (user.user_status === "ACTIVO") {
        return reply
          .status(400)
          .send({ message: "Este usuário já está ativo." });
      }

      const tempPassword = randomBytes(6).toString("base64url");
      const hashedPassword = await hash(tempPassword, 12);

      await prisma.users.update({
        where: { id_user: id },
        data: {
          senha: hashedPassword,
          must_change_password: true,
          password_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          user_status: "PENDENTE",
        },
      });

      try {
        await sendWelcomeEmail({
          to: user.email,
          name: user.name,
          password: tempPassword,
          role: user.role,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return reply
          .status(200)
          .send({ message: "Convite reenviado com sucesso." });
      } catch (error: any) {
        console.error("❌ Erro ao enviar email:", error);
        return reply.status(500).send({
          message: "Erro ao enviar email. Verifique as credenciais SMTP.",
        });
      }
    },
  );
};