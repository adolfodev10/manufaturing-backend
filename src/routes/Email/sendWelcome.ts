// backend/routes/email.routes.ts
import { FastifyInstance } from 'fastify';
import { sendWelcomeEmail } from '../../modules/services/email/emailService';

// Interface para o body da requisição (padronizada)
interface WelcomeEmailBody {
  to: string;
  name: string;
  password: string;
}

export const SendWelcomeEmailRoute = async (app: FastifyInstance) => {
  app.post('/email/welcome', async (req, reply) => {
    try {
      // 1️⃣ Extrair e validar os dados
      const { to, name, password } = req.body as WelcomeEmailBody;

      // 2️⃣ Validação completa dos campos
      if (!to || !name || !password) {
        return reply.status(400).send({
          success: false,
          error: 'Dados incompletos. Envie: { to, name, password }'
        });
      }

      // 3️⃣ Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return reply.status(400).send({
          success: false,
          error: 'Email inválido'
        });
      }

      // 4️⃣ Validar tamanho mínimo dos campos
      if (name.length < 2) {
        return reply.status(400).send({
          success: false,
          error: 'Nome deve ter pelo menos 2 caracteres'
        });
      }

      if (password.length < 4) {
        return reply.status(400).send({
          success: false,
          error: 'Senha deve ter pelo menos 4 caracteres'
        });
      }

      console.log('📧 Recebida requisição para enviar email:', { to, name });

      // 5️⃣ Enviar email (passando um OBJETO, não parâmetros separados)
      const success = await sendWelcomeEmail({ to, name, password });

      // 6️⃣ Retornar resposta apropriada
      if (success) {
        return reply.status(200).send({
          success: true,
          message: 'Email de boas-vindas enviado com sucesso'
        });
      } else {
        return reply.status(500).send({
          success: false,
          error: 'Falha ao enviar email. Verifique as configurações SMTP.'
        });
      }

    } catch (error) {
      console.error('❌ Erro na rota /email/welcome:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor ao processar requisição'
      });
    }
  });
};