// backend/modules/services/email/emailService.ts
import { Resend } from 'resend';

interface WelcomeEmailData {
  to: string;
  name: string;
  password: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const { to, name, password } = data;

  if (!to || !name || !password) {
    console.error('❌ Parâmetros faltando');
    return false;
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'EKO <adolfomanueldev10@gmail.com>', // Email temporário do Resend
      to: [to],
      subject: 'Bem-vindo ao EKO - Sistema de Manufaturação',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #7c3aed;">Olá ${name}! 🎉</h2>
          <p>Sua conta foi criada com sucesso no sistema EKO.</p>
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Senha:</strong> <code>${password}</code></p>
          <a href="${process.env.FRONTEND_URL}/auth/login" 
             style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
            Fazer Login
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            ⚠️ Recomendamos alterar sua senha após o primeiro acesso.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log('✅ Email enviado via Resend:', emailData?.id);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}