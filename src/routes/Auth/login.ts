import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { comparePassword } from "../../modules/services/bcrypt/verifyPassword";
import { generateToken } from "../../modules/services/jwt/generateToken";

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
          return reply.status(401).send({ error: 'Credenciais inválidas' });
        }

        const isValid = await comparePassword(password, user.senha);

        if (!isValid) {
          return reply.status(401).send({ error: 'Credenciais inválidas' });
        }

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
        };

        return { user: userWithoutPassword, token };

      } catch (error: any) {
        const duration = Date.now() - startTime;
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    });
};