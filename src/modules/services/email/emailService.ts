import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true para porta 465, false para 587 [citation:9]
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string, password: string) {
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
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}