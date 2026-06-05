"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authenticateRequest = exports.isPublicRoute = void 0;
const prismaclient_1 = require("../../../lib/prismaclient");
const verifyToken_1 = require("../jwt/verifyToken");
const publicRoutes = new Set([
    "GET /",
    "POST /auth/login",
    "POST /auth/validateToken",
]);
const isPublicRoute = (method, routePath) => {
    if (method.toUpperCase() === "OPTIONS") {
        return true;
    }
    if (!routePath) {
        return false;
    }
    return publicRoutes.has(`${method.toUpperCase()} ${routePath}`);
};
exports.isPublicRoute = isPublicRoute;
const authenticateRequest = async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Token nao fornecido" });
    }
    const token = authHeader.slice("Bearer ".length).trim();
    const decoded = await (0, verifyToken_1.verifyToken)(token);
    if (!decoded || typeof decoded === "string" || !("id_user" in decoded)) {
        return reply.status(401).send({ error: "Token invalido ou expirado" });
    }
    const user = await prismaclient_1.prisma.users.findUnique({
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
exports.authenticateRequest = authenticateRequest;
const requireRoles = (roles) => {
    return async (request, reply) => {
        await (0, exports.authenticateRequest)(request, reply);
        if (reply.sent) {
            return;
        }
        const userRole = request.authenticatedUser?.role;
        if (!userRole || !roles.includes(userRole)) {
            return reply.status(403).send({ error: "Nao tens permissao para esta acao" });
        }
    };
};
exports.requireRoles = requireRoles;
