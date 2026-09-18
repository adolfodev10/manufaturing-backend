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
    // Deixa passar rotas públicas
    if (PUBLIC_ROUTES.some((r) => request.url.startsWith(r))) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Token não fornecido" });
    }

    const [, token] = authHeader.split(" ");
    if (!token) {
      return reply.status(401).send({ error: "Token inválido" });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || typeof decoded !== "object" || !decoded.id_user) {
      return reply.status(401).send({ error: "Token inválido ou expirado" });
    }

    // Buscar o user para ter sempre o role actualizado
    const user = await prisma.users.findUnique({
      where: { id_user: decoded.id_user },
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

    // ✅ AGORA `request.user` existe em TODAS as rotas protegidas
    (request as any).user = {
      id: user.id_user,
      id_user: user.id_user,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  });
};