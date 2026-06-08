// backend/services/email.service.js
import nodemailer from 'nodemailer';
import dns from 'dns';

// Forçar IPv4 para evitar ENETUNREACH
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // ✅ IMPORTANTE: false para porta 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4, // ✅ Força IPv4
  tls: {
    rejectUnauthorized: false, // Apenas para testes
  },
  connectionTimeout: 30000,
  socketTimeout: 30000,
});

export async function sendWelcomeEmail(to: string, name: string, password: string) {
  // Validar configurações antes de tentar enviar
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP não configurado no .env');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Bem-vindo ao Sistema de Manufaturação - EKO',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #7c3aed;">Bem-vindo, ${name}! 🎉</h2>
        <p>Sua conta foi criada com sucesso no sistema de manufaturação.</p>
        <p><strong>Sua senha de acesso é:</strong></p>
        <div style="background: #f3f4f6; padding: 12px; text-align: center; font-size: 18px; font-family: monospace;">
          ${password}
        </div>
        <p style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL}/auth/login" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
            Fazer Login
          </a>
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          ⚠️ Recomendamos alterar sua senha após o primeiro acesso.
        </p>
      </div>
    `,
  };

  try {
    console.log(`📧 Tentando enviar email para: ${to}`);
    console.log(`🔧 Configurações: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ Erro detalhado ao enviar email:', {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    return false;
  }
}