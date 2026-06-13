// backend/modules/services/email/emailService.ts
import nodemailer from 'nodemailer';
import dns from 'dns';

// Forçar IPv4 para evitar problemas de rede
dns.setDefaultResultOrder('ipv4first');

// Interface padronizada para os dados do email
interface WelcomeEmailData {
  to: string;
  name: string;
  password: string;
}

// Configuração do transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4, // Força IPv4
  tls: {
    rejectUnauthorized: false, // Apenas para desenvolvimento
  },
  connectionTimeout: 30000,
  socketTimeout: 30000,
});

/**
 * Envia email de boas-vindas para novos usuários
 * @param data Objeto com to, name, password
 * @returns Promise<boolean> - true se enviado com sucesso
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const { to, name, password } = data;

  // Validação dos parâmetros
  if (!to || !name || !password) {
    console.error('❌ Parâmetros faltando em sendWelcomeEmail:', { to, name, password });
    return false;
  }

  // Validação das configurações SMTP
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP não configurado no .env');
    return false;
  }

  console.log(`📧 Enviando email para: ${to}`);
  console.log(`👤 Nome: ${name}`);
  console.log(`🔐 Senha: ${password}`);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Bem-vindo ao EKO - Sistema de Manufaturação',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">EKO</h1>
          <p style="color: #6b7280; margin: 5px 0 0;">Sistema de Manufaturação</p>
        </div>
        
        <h2 style="color: #7c3aed;">Olá ${name}! 🎉</h2>
        
        <p>Sua conta foi criada com sucesso no sistema EKO.</p>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold;">🔐 Suas credenciais de acesso:</p>
          <p style="margin: 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 8px 0 0 0;"><strong>Senha:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
        </div>
        
        <p>Para acessar o sistema, clique no botão abaixo:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/auth/login" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            🔗 Fazer Login
          </a>
        </div>
        
        <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            ⚠️ <strong>Importante:</strong> Recomendamos alterar sua senha após o primeiro acesso.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} EKO - Sistema de Manufaturação. Todos os direitos reservados.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}