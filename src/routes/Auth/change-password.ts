import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";
import { hashPassword } from "../../modules/services/bcrypt/hashPassword";
import { comparePassword } from "../../modules/services/bcrypt/verifyPassword";
import { verifyToken } from "../../modules/services/jwt/verifyToken";

export const ChangePassword = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/auth/change-password",
    {
      schema: {
        body: z.object({
          currentPassword: z.string(),
          newPassword: z.string().min(8),
        }),
      },
    },
    async (req, res) => {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).send({ error: "Token não fornecido" });
      }

      const token = authHeader.replace("Bearer ", "");
      const payload = await verifyToken(token);
      const userId = typeof payload === "object" && payload !== null ? payload.id_user : undefined;

      if (!userId) {
        return res.status(401).send({ error: "Token inválido" });
      }

      const user = await prisma.users.findUnique({
        where: { id_user: userId },
      });

      if (!user) {
        return res.status(404).send({ error: "Usuário não encontrado" });
      }

      const isValid = await comparePassword(
        req.body.currentPassword,
        user.senha,
      );

      if (!isValid) {
        return res.status(401).send({ error: "Senha atual incorreta" });
      }

      const newHashed = await hashPassword(req.body.newPassword);

      await prisma.users.update({
        where: { id_user: user.id_user },
        data: {
          senha: newHashed,
          must_change_password: false,
          password_expires_at: null,
          user_status: "ACTIVO",
          updated_at: new Date(),
        },
      });

      return res.send({
        success: true,
        message: "Senha alterada com sucesso",
      });
    },
  );
};