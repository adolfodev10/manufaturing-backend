"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProduct = void 0;
const create_product_1 = require("../../modules/validations/product/create-product");
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const crypto_1 = require("crypto");
const CreateProduct = async (app) => {
    app.withTypeProvider().post('/product/create', {
        schema: {
            body: create_product_1.createProductSchema
        },
    }, async (request, reply) => {
        const startTime = Date.now();
        const { name, price, category, quantity, date_validate } = request.body;
        const ip = request.ip || request.socket.remoteAddress || "unknown";
        const user = request.user?.email || "sistema";
        const userId = request.user?.id;
        try {
            // Verificar se já existe produto com o mesmo nome
            const productExists = await prismaclient_1.prisma.products.findFirst({
                where: {
                    name_product: name,
                    estado: { not: "VENDIDO" }
                }
            });
            if (productExists) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Criar Produto",
                    user,
                    user_id: userId,
                    details: `Tentativa de criar produto duplicado: "${name}". Produto existente ID: ${productExists.id_product}`,
                    ip,
                    resource: "products",
                    resource_id: productExists.id_product,
                    duration,
                });
                return reply.status(409).send({
                    message: "Já existe um produto com este nome",
                    productExists
                });
            }
            const product = await prismaclient_1.prisma.products.create({
                data: {
                    id_product: (0, crypto_1.randomUUID)(),
                    name_product: name ?? "",
                    price,
                    category: category ?? "Sem categoria",
                    date_validate: date_validate ?? "",
                    quantity: quantity ?? "0",
                    updated_at: new Date(),
                    created_at: new Date(),
                    estado: "NAO_VENDIDO",
                }
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Criar Produto",
                user,
                user_id: userId,
                details: `Produto criado com sucesso. ` +
                    `ID: ${product.id_product} | ` +
                    `Nome: "${product.name_product}" | ` +
                    `Categoria: ${product.category} | ` +
                    `Preço: ${Number(product.price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} | ` +
                    `Quantidade: ${product.quantity} | ` +
                    `Validade: ${product.date_validate || 'Não definida'}`,
                ip,
                resource: "products",
                resource_id: product.id_product,
                duration,
            });
            return reply.status(201).send({
                message: "Produto criado com sucesso",
                product
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Criar Produto",
                user,
                user_id: userId,
                details: `Erro ao criar produto "${name}": ${error.message}`,
                ip,
                resource: "products",
                duration,
            });
            console.error("Erro ao criar produto:", error);
            return reply.status(500).send({
                error: "Erro ao criar produto",
                message: error.message
            });
        }
    });
};
exports.CreateProduct = CreateProduct;
