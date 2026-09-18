import { FastifyInstance } from "fastify";
import { verifyToken } from "../modules/services/jwt/verifyToken";
import { prisma } from "../lib/prismaclient";

// Rotas que NÃO precisam de token
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/validateToken",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export const authPlugin = async (app: FastifyInstance) => {
  app.addHook("onRequest", async (request, reply) => {
    const url = request.url.split("?")[0];   // ✅ ignora querystring

    // ✅ Health check do Render (comparação EXACTA)
    if (url === "/") return;

    // ✅ Rotas públicas (startsWith é seguro porque não há "/" na lista)
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

    // ✅ Aceita id ou id_user (compatibilidade)
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

    // ✅ Popula request.user para TODAS as rotas protegidas
    (request as any).user = {
      id: user.id_user,
      id_user: user.id_user,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  });
};