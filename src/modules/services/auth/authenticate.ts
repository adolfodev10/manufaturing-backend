import { FastifyReply, FastifyRequest } from "fastify";
import { Role, Users } from "@prisma/client";
import { prisma } from "../../../lib/prismaclient";
import { verifyToken } from "../jwt/verifyToken";

export type AuthenticatedUser = Pick<
  Users,
  "id_user" | "name" | "email" | "phone_number" | "avatar" | "born" | "role" | "user_status"
>;

declare module "fastify" {
  interface FastifyRequest {
    authenticatedUser?: AuthenticatedUser;
  }
}

const publicRoutes = new Set([
  "GET /",
  "POST /auth/login",
  "POST /auth/validateToken",
]);

export const isPublicRoute = (method: string, routePath?: string) => {
  if (method.toUpperCase() === "OPTIONS") {
    return true;
  }

  if (!routePath) {
    return false;
  }

  return publicRoutes.has(`${method.toUpperCase()} ${routePath}`);
};

export const authenticateRequest = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Token nao fornecido" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const decoded = await verifyToken(token);

  if (!decoded || typeof decoded === "string" || !("id_user" in decoded)) {
    return reply.status(401).send({ error: "Token invalido ou expirado" });
  }

  const user = await prisma.users.findUnique({
    where: { id_user: String(decoded.id_user) },
    select: {
      id_user: true,
      name: true,
      email: true,
      phone_number: true,
      avatar: true,
      born: true,
      role: true,
      user_status: true,
    },
  });

  if (!user || user.user_status !== "ACTIVO") {
    return reply.status(401).send({ error: "Usuario nao encontrado ou inativo" });
  }

  request.authenticatedUser = user;
};

export const requireRoles = (roles: Role[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticateRequest(request, reply);

    if (reply.sent) {
      return;
    }

    const userRole = request.authenticatedUser?.role;

    if (!userRole || !roles.includes(userRole)) {
      return reply.status(403).send({ error: "Nao tens permissao para esta acao" });
    }
  };
};
