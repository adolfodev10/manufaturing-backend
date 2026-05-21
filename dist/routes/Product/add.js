"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProductInStock = void 0;
const add_product_1 = require("../../modules/validations/product/add-product");
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const crypto_1 = require("crypto");
const AddProductInStock = async (app) => {
    app.withTypeProvider().post('/product/add', {
        schema: {
            body: add_product_1.addProductSchema
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { name_product, price, quantity, date_validate, category, user_id } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            // Verificar se já existe produto com mesmo nome (opcional)
            const existingProduct = await prismaclient_1.prisma.products.findFirst({
                where: {
                    name_product,
                    estado: { not: "VENDIDO" }
                }
            });
            if (existingProduct) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Adicionar Produto",
                    user,
                    user_id: userId,
                    details: `Tentativa de adicionar produto com nome duplicado: "${name_product}". Produto existente ID: ${existingProduct.id_product}`,
                    ip,
                    resource: "products",
                    duration,
                });
                return reply.status(409).send({
                    message: "Já existe um produto com este nome em stock",
                    produto_existente: existingProduct.id_product
                });
            }
            const addProduct = await prismaclient_1.prisma.products.create({
                data: {
                    name_product: name_product ?? "",
                    category: category ?? "Sem categoria",
                    date_validate: date_validate ?? "",
                    price,
                    quantity,
                    updated_at: new Date(),
                    created_at: new Date(),
                    estado: "NAO_VENDIDO",
                    id_product: (0, crypto_1.randomUUID)(),
                }
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Adicionar Produto",
                user,
                user_id: userId,
                details: `Produto adicionado ao stock com sucesso. ` +
                    `ID: ${addProduct.id_product} | ` +
                    `Nome: "${addProduct.name_product}" | ` +
                    `Categoria: ${addProduct.category} | ` +
                    `Preço: ${Number(addProduct.price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} | ` +
                    `Quantidade: ${addProduct.quantity} | ` +
                    `Validade: ${addProduct.date_validate || 'Não definida'}`,
                ip,
                resource: "products",
                resource_id: addProduct.id_product,
                duration,
            });
            return reply.status(201).send({
                message: "Produto adicionado com sucesso",
                product: addProduct
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Adicionar Produto",
                user,
                user_id: userId,
                details: `Erro ao adicionar produto "${name_product}": ${error.message}`,
                ip,
                resource: "products",
                duration,
            });
            console.error("Erro ao adicionar produto:", error);
            return reply.status(500).send({
                error: "Erro ao adicionar produto",
                message: error.message
            });
        }
    });
};
exports.AddProductInStock = AddProductInStock;
