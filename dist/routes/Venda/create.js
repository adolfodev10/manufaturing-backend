"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVenda = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const create_venda_1 = require("../../modules/validations/venda/create-venda");
const logger_1 = require("../../modules/services/logs/logger");
const crypto_1 = require("crypto");
const zod_1 = __importDefault(require("zod"));
const CreateVenda = async (app) => {
    app.withTypeProvider().post('/venda/create', {
        schema: {
            body: create_venda_1.createVendaSchema,
            params: zod_1.default.object({}),
        },
    }, async (req, res) => {
        const startTime = Date.now();
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const user = req.user?.name || 'sistema';
        const { id_user } = req.body;
        const userId = await prismaclient_1.prisma.users.findFirst({
            where: {
                id_user
            }
        });
        console.log("🐛🐛🐛 User ID: ", userId);
        try {
            const { name_product, category, estado, date_venda, methodPayment, price, date_validate, quantity, created_at, updated_at } = req.body;
            const venda = await prismaclient_1.prisma.venda.create({
                data: {
                    name_product: name_product ?? "",
                    category: category ?? "",
                    estado: estado ?? "VENDIDO",
                    methodPayment,
                    price: String(price ?? "0"),
                    date_validate: new Date(date_validate),
                    quantity: quantity ?? "0",
                    date_venda: date_venda ? new Date(date_venda) : new Date(),
                    created_at: new Date(created_at),
                    updated_at: new Date(updated_at),
                    id: (0, crypto_1.randomUUID)(),
                    user_id: userId?.id_user
                },
            });
            const duration = Date.now() - startTime;
            logger_1.logger.logSync({
                level: "SUCCESS",
                action: "Criar Venda",
                user: user,
                details: `Venda criada: ${name_product} - Qtd: ${quantity} - Preço: ${price}`,
                ip,
                resource: "vendas",
                resource_id: venda.id,
                new_value: JSON.stringify({ name_product, category, methodPayment, price, quantity, date_venda }),
                duration,
            });
            return res.status(201).send(venda);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.logger.logSync({
                level: "ERROR",
                action: "Criar Venda",
                user,
                details: `Erro ao criar venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                ip,
                resource: "vendas",
                duration,
                old_value: JSON.stringify(req.body), // 👈 String, não Object
            });
            console.error("Erro ao criar venda:", error);
            return res.status(500).send({
                message: "Erro interno ao criar venda",
                error: error instanceof Error ? error.message : error,
            });
        }
    });
};
exports.CreateVenda = CreateVenda;
