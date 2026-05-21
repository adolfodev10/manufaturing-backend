"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDivida = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const create_divida_schema_1 = require("../../modules/validations/dividas/create-divida-schema");
const CreateDivida = async (app) => {
    app.withTypeProvider().post("/divida/create", {
        schema: {
            body: create_divida_schema_1.createDividaSchema
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id_divida, client_id, product_id = "", price, date } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            // Verificar se o cliente existe
            const clientExists = await prismaclient_1.prisma.clients.findUnique({
                where: { id_client: client_id },
                select: { id_client: true, name: true }
            });
            if (!clientExists) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Criar Dívida",
                    user,
                    user_id: userId,
                    details: `Tentativa de criar dívida com cliente inexistente. Cliente ID: ${client_id}`,
                    ip,
                    resource: "dividas",
                    duration,
                });
                return reply.status(404).send({
                    error: "Cliente não encontrado"
                });
            }
            // Verificar se já existe dívida com mesmo ID
            const existingDivida = await prismaclient_1.prisma.dividas.findUnique({
                where: { id_divida }
            });
            if (existingDivida) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Criar Dívida",
                    user,
                    user_id: userId,
                    details: `Tentativa de criar dívida com ID duplicado. ID: ${id_divida}`,
                    ip,
                    resource: "dividas",
                    resource_id: id_divida,
                    duration,
                });
                return reply.status(409).send({
                    error: "Já existe uma dívida com este ID"
                });
            }
            const data = {
                id_divida,
                client_id,
                price,
                date: date || new Date(),
                approval: 'NAO_PAGAS',
                updated_at: new Date(),
                created_at: new Date(),
            };
            if (product_id) {
                data.product_id = product_id;
            }
            const divida = await prismaclient_1.prisma.dividas.create({ data });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Criar Dívida",
                user,
                user_id: userId,
                details: `Dívida registada com sucesso. ` +
                    `ID: ${id_divida} | ` +
                    `Cliente: ${clientExists.name} (${client_id}) | ` +
                    `Valor: ${price.toLocaleString()} | ` +
                    `Produto: ${product_id || 'Não especificado'} | ` +
                    `Estado: Pendente (NAO_PAGAS)`,
                ip,
                resource: "dividas",
                resource_id: id_divida,
                duration,
            });
            return reply.status(201).send({ divida });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Criar Dívida",
                user,
                user_id: userId,
                details: `Erro ao registar dívida ID ${id_divida}: ${error.message}`,
                ip,
                resource: "dividas",
                resource_id: id_divida,
                duration,
            });
            console.error("Erro ao criar dívida:", error);
            return reply.status(500).send({
                error: "Erro ao registar dívida",
                message: error.message
            });
        }
    });
};
exports.CreateDivida = CreateDivida;
