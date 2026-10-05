import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

interface SendWelcomeEmailParams {
  to: string;
  name: string;
  password: string;
  role: string;
  expiresAt: Date;
}

export async function sendWelcomeEmail({
  to,
  name,
  password,
  role,
  expiresAt,
}: SendWelcomeEmailParams) {
  const formattedDate = expiresAt.toLocaleString("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  });

  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Bem-vindo ao Sistema — Credenciais de Acesso",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: Arial, sans-serif; background:#f4f4f7; padding:40px 0; margin:0;">
          <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#7c3aed,#a855f7); padding:32px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:22px;">Bem-vindo ao Sistema</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#333; font-size:15px;">Olá <strong>${name}</strong>,</p>
              <p style="color:#555; font-size:14px; line-height:1.6;">
                A sua conta foi criada com a função de <strong>${role}</strong>.
                Use as credenciais abaixo para acessar o sistema:
              </p>
              <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:20px; margin:24px 0;">
                <p style="margin:0 0 12px 0; font-size:13px; color:#6b7280;">EMAIL</p>
                <p style="margin:0 0 20px 0; font-size:15px; color:#111827; font-family:monospace;">${to}</p>
                <p style="margin:0 0 12px 0; font-size:13px; color:#6b7280;">SENHA TEMPORÁRIA</p>
                <p style="margin:0; font-size:20px; color:#7c3aed; font-family:monospace; font-weight:bold;">${password}</p>
              </div>
              <p style="color:#dc2626; font-size:13px; background:#fef2f2; padding:12px; border-radius:6px; border-left:3px solid #dc2626;">
                ⚠️ Esta senha expira em <strong>${formattedDate}</strong>. No primeiro login será obrigatório definir uma nova senha.
              </p>
              <p style="color:#555; font-size:13px; margin-top:24px;">
                Se não solicitou esta conta, ignore este email.
              </p>
            </div>
            <div style="background:#f9fafb; padding:20px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} Sistema Eko — Todos os direitos reservados
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}