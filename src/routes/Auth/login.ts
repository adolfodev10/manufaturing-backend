import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { comparePassword, verifyPassword } from "../../modules/services/bcrypt/verifyPassword";
import { generateToken } from "../../modules/services/jwt/generateToken";
import { logger } from "../../modules/services/logs/logger";

export const Login = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/auth/login', {
    schema: {
      body: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      params: z.object({}),
    },
  },
    async (request, reply) => {
      const startTime = Date.now();
      const { email, password } = request.body;
      const ip = request.ip || request.socket.remoteAddress || "unknown";

      try {
      const user = await prisma.users.findFirst({
        where: {
          email,
          user_status: "ACTIVO"
        },
      });

      if (!user) {
        const duration = Date.now() - startTime;

        await logger.warning({
          action: "Login",
          user: email,
          details: "Tentativa de login com email não encontrado",
          ip,
          resource: "auth",
          duration,
        });
        return reply.status(401).send({ error: 'Credentials invalid' });
      }

      const isValid = await comparePassword(password, user.senha);

      if (!isValid) {
        const duration = Date.now() - startTime;

        await logger.warning({
          action: "Login",
          user: email,
          details: "Tentativa de login com senha inválida",
          ip,
          resource: "auth",
          duration,
        });
        return reply.status(401).send({ error: 'Credentials invalid' });
      }

      const duration = Date.now() - startTime;

      await logger.success({
        action: "Login",
        user: email,
        details: "Login realizado com sucesso",
        ip,
        resource: "auth",
        duration,
      });

      const token = await generateToken({
        id_user: user.id_user,
        email: user.email
      });

      const userWithoutPassword = {
        id_user: user.id_user,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        born: user.born,
        role: user.role,
      }
      return { user: userWithoutPassword, token };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      await logger.error({
        action: "Login",
        user: email,
        details: `Erro durante login: ${error.message}`,
        ip,
        resource: "auth",
        duration,
      });
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}