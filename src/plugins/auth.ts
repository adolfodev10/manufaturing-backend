import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { verifyToken } from "../modules/services/jwt/verifyToken";
import { prisma } from "../lib/prismaclient";

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/validateToken",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export const authPlugin = fp(async (app: FastifyInstance) => {

  app.addHook("onRequest", async (request, reply) => {
    const url = request.url.split("?")[0];

    if (url === "/") return;
    if (PUBLIC_ROUTES.some((r) => url.startsWith(r))) return;

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Token não fornecido" });
    }

    const [, token] = authHeader.split(" ");
    if (!token) {
      return reply.status(401).send({ error: "Token inválido" });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || typeof decoded !== "object") {
      return reply.status(401).send({ error: "Token inválido ou expirado" });
    }

    const userId = decoded.id_user || decoded.id;
    if (!userId) {
      return reply.status(401).send({ error: "Token inválido: sem id" });
    }

    const user = await prisma.users.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return reply.status(401).send({ error: "Utilizador não encontrado" });
    }

    (request as any).user = {
      id: user.id_user,
      id_user: user.id_user,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  });
});