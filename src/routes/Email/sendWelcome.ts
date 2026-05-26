import { FastifyInstance } from "fastify";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const SendWelcomeEmail = async (app: FastifyInstance) => {
  app.post("/email/send-welcome", async (req, reply) => {
    const { to, subject, html } = req.body as any;
    
    await transporter.sendMail({
      from: `"Sistema" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });
    
    return reply.send({ success: true });
  });
};