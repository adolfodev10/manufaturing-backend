import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const ForgotPassword = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/auth/forgot-password', {
    schema: {
      body: z.object({
        email: z.string().email(),
      }),
    },
  }, async (request, reply) => {
    const { email } = request.body;

    try {
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        // Não revelar se o email existe ou não (segurança)
        return reply.send({ 
          message: "Se o email existir, enviaremos um link de recuperação." 
        });
      }

      // Gerar token de recuperação
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

      // Salvar token no banco (adicione estes campos no schema se quiser)
      // Por enquanto, vamos usar o system_config
      await prisma.system_config.upsert({
        where: { key: `reset_${user.id_user}` },
        create: {
          key: `reset_${user.id_user}`,
          value: {
            token: resetToken,
            expiry: resetTokenExpiry.toISOString(),
          },
        },
        update: {
          value: {
            token: resetToken,
            expiry: resetTokenExpiry.toISOString(),
          },
        },
      });

      // Configurar transporte de email
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}&email=${email}`;

      await transporter.sendMail({
        from: `"EKO Bebidas" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Recuperação de Senha - EKO",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">EKO - Recuperação de Senha</h2>
            <p>Olá <strong>${user.name}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; 
                      color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
              Redefinir Senha
            </a>
            <p style="color: #6b7280; font-size: 14px;">
              Este link expira em 1 hora. Se você não solicitou esta alteração, ignore este email.
            </p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">
              EKO - Sistema de Gestão de Bebidas
            </p>
          </div>
        `,
      });

      return reply.send({ 
        message: "Se o email existir, enviaremos um link de recuperação." 
      });
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      return reply.status(500).send({ error: "Erro ao processar solicitação" });
    }
  });
};