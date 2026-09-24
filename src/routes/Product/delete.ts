import { FastifyInstance, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { verifyToken } from "../../modules/services/jwt/verifyToken";

const rolesPermitidas = ["ADMINISTRADOR", "GERENTE"];

export const DeleteProduct = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/product/delete/:id_product", {
        schema: {
            params: z.object({
                id_product: z.string().nonempty("O Campo id é obrigatório."),
            }),
        },
    }, async (req: FastifyRequest, reply) => {
        const startTime = Date.now();
        const { id_product } = req.params as { id_product: string };
        const ip = req.ip || req.socket.remoteAddress || "unknown";

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return reply.status(401).send({ error: "Token não fornecido" });
            }

            const token = authHeader.split(" ")[1];
            const decoded = await verifyToken(token);
            if (!decoded || typeof decoded === "string" || !("id_user" in decoded)) {
                return reply.status(401).send({ error: "Token inválido ou expirado" });
            }

            const authUser = await prisma.users.findUnique({
                where: { id_user: decoded.id_user },
            });

            if (!authUser) {
                return reply.status(401).send({ error: "Usuário não encontrado" });
            }

            
        if (!rolesPermitidas.includes(authUser?.role)) {
                await logger.warning({
                    action: "DeleteProduct",
                    user: authUser.email,
                    details: `Tentativa de apagar produto sem permissão. Role: ${authUser.role}`,
                    ip,
                    resource: "product",
                    resource_id: id_product,
                    duration: Date.now() - startTime,
                });
                return reply.status(403).send({
                    error: "Não tens permissão para apagar produtos"
                });
            }

            const product = await prisma.products.findUnique({
                where: { id_product },
            });

            if (!product) {
                const duration = Date.now() - startTime;
                await logger.warning({
                    action: "DeleteProduct",
                    user: authUser.email,
                    details: "Tentativa de apagar produto inexistente",
                    ip,
                    resource: "product",
                    resource_id: id_product,
                    duration: Date.now() - startTime,
                });
                return reply.status(404).send({ message: "Produto não encontrado" });
            }

            await prisma.produtosExpirados.create({
                data: {
                    id_product: product.id_product,
                    name_product: product.name_product,
                    category: product.category,
                    price: product.price,
                    quantity: product.quantity,
                    date_validate: product.date_validate ? new Date(product.date_validate) : new Date(),
                    date_expired: new Date(),
                    motivo: "Eliminado pelo utilizador",
                    deleted_by: authUser.email,
                }
            });

            await prisma.products.delete({
                where: { id_product },
            });

            await logger.success({
                action: "Eliminar Produtos",
                user: authUser.email,
                details: `Produto "${product.name_product}" apagado com sucesso`,
                ip,
                resource: "product",
                resource_id: id_product,
                duration: Date.now() - startTime,
            });

            return reply.status(200).send({
                message: "Produto apagado com sucesso",
                product: product.name_product
            });

        } catch (error: any) {
            await logger.error({
                action: "Eliminar Produtos",
                user: "unknown",
                details: `Erro ao apagar produto: ${error.message}`,
                ip,
                resource: "product",
                resource_id: id_product,
                duration: Date.now() - startTime,
            });

            if (error.message === "jwt expired" || error.message === "invalid token") {
                return reply.status(401).send({ error: "Token inválido ou expirado" });
            }

            if (error.code === "P2003") {
                return reply.status(409).send({
                    error: "Produto não pode ser eliminado: existem registos vinculados."
                });
            }

             if (error.code === "P2025") {
                return reply.status(404).send({
                    error: "Produto não encontrado."
                });
            }

            return reply.status(500).send({ error: "Erro interno ao apagar produto" });
        }
    });
};