import { FastifyInstance } from 'fastify';
import { sendWelcomeEmail } from '../../modules/services/email/emailService';

export const SendWelcomeEmailRoute = async (app: FastifyInstance) => {
  app.post('/email/welcome', async (req, reply) => {
    const { to, name, password } = req.body as { to: string; name: string; password: string };
    
    const success = await sendWelcomeEmail(to, name, password);
    return reply.send({ success });
  });
};