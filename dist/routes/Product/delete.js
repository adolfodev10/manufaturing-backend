"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProduct = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const verifyToken_1 = require("../../modules/services/jwt/verifyToken");
const DeleteProduct = async (app) => {
    app.withTypeProvider().delete("/product/delete/:id_product", {
        schema: {
            params: zod_1.z.object({
                id_product: zod_1.z.string().nonempty("O Campo id é obrigatório."),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id_product } = req.params;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        try {
            // 1. Verificar token e obter usuário
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return reply.status(401).send({ error: "Token não fornecido" });
            }
            const token = authHeader.split(" ")[1];
            const decoded = await (0, verifyToken_1.verifyToken)(token);
            if (!decoded || typeof decoded === "string" || !("id_user" in decoded)) {
                return reply.status(401).send({ error: "Token inválido ou expirado" });
            }
            const user = await prismaclient_1.prisma.users.findUnique({
                where: { id_user: decoded.id_user },
            });
            if (!user) {
                return reply.status(401).send({ error: "Usuário não encontrado" });
            }
            // 2. Verificar permissão (ADMINISTRADOR ou GERENTE)
            const rolesPermitidas = ["ADMINISTRADOR", "GERENTE"];
            if (!rolesPermitidas.includes(user.role)) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "DeleteProduct",
                    user: user.email,
                    details: `Tentativa de apagar produto sem permissão. Role: ${user.role}`,
                    ip,
                    resource: "product",
                    resource_id: id_product,
                    duration,
                });
                return reply.status(403).send({
                    error: "Não tens permissão para apagar produtos"
                });
            }
            // 3. Buscar o produto
            const product = await prismaclient_1.prisma.products.findUnique({
                where: { id_product },
            });
            if (!product) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "DeleteProduct",
                    user: user.email,
                    details: "Tentativa de apagar produto inexistente",
                    ip,
                    resource: "product",
                    resource_id: id_product,
                    duration,
                });
                return reply.status(404).send({ message: "Produto não encontrado" });
            }
            await prismaclient_1.prisma.produtosExpirados.create({
                data: {
                    id_product: product.id_product,
                    name_product: product.name_product,
                    category: product.category,
                    price: product.price,
                    quantity: product.quantity,
                    date_validate: product.date_validate,
                    date_expired: new Date(),
                    motivo: "Eliminado pelo utilizador",
                    deleted_by: user.email,
                }
            });
            // 4. Apagar o produto
            await prismaclient_1.prisma.products.delete({
                where: { id_product },
            });
            // 5. Registar log de sucesso
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Eliminar Produtos",
                user: user.email,
                details: `Produto "${product.name_product}" apagado com sucesso`,
                ip,
                resource: "product",
                resource_id: id_product,
                duration,
            });
            return reply.status(200).send({
                message: "Produto apagado com sucesso",
                product: product.name_product
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Eliminar Produtos",
                user: "unknown",
                details: `Erro ao apagar produto: ${error.message}`,
                ip,
                resource: "product",
                resource_id: id_product,
                duration,
            });
            if (error.message === "jwt expired" || error.message === "invalid token") {
                return reply.status(401).send({ error: "Token inválido ou expirado" });
            }
            return reply.status(500).send({ error: "Erro interno ao apagar produto" });
        }
    });
};
exports.DeleteProduct = DeleteProduct;
