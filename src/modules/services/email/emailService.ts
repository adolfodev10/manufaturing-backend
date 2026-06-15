// const Brevo = require('@getbrevo/brevo');

// interface WelcomeEmailData {
//   to: string;
//   name: string;
//   password: string;
// }

// const apiInstance = new Brevo.TransactionalEmailsApi();
// apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

// export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
//   const { to, name, password } = data;

//   if (!to || !name || !password) {
//     console.error('❌ Parâmetros faltando');
//     return false;
//   }

//   const sendSmtpEmail = new Brevo.SendSmtpEmail();
//   sendSmtpEmail.subject = 'Bem-vindo ao EKO - Sistema de Manufaturação';
//   sendSmtpEmail.to = [{ email: to, name }];
//   sendSmtpEmail.sender = { email: process.env.BREVO_FROM!, name: 'EKO Sistema' };
//   sendSmtpEmail.htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px;">
//       <h2 style="color: #7c3aed;">Olá ${name}! 🎉</h2>
//       <p>Sua conta foi criada com sucesso no sistema EKO.</p>
//       <p><strong>Email:</strong> ${to}</p>
//       <p><strong>Senha:</strong> <code>${password}</code></p>
//       <a href="${process.env.FRONTEND_URL}/auth/login" 
//          style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
//         Fazer Login
//       </a>
//       <p style="margin-top: 20px; font-size: 12px; color: #666;">
//         ⚠️ Recomendamos alterar sua senha após o primeiro acesso.
//       </p>
//     </div>
//   `;

//   try {
//     await apiInstance.sendTransacEmail(sendSmtpEmail);
//     console.log('✅ Email enviado via Brevo');
//     return true;
//   } catch (error) {
//     console.error('❌ Erro Brevo:', error);
//     return false;
//   }
// }