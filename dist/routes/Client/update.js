"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClient = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const UpdateClient = async (app) => {
    app.withTypeProvider().put("/client/update/:id_client", {
        schema: {
            params: zod_1.default.object({
                id_client: zod_1.default.string().uuid(),
            }),
            body: zod_1.default.object({
                name: zod_1.default.string(),
                telefone: zod_1.default.string().optional(),
                nif: zod_1.default.string().optional(),
            }),
        },
    }, async (req, res) => {
        const startTime = Date.now();
        const { id_client } = req.params;
        const { name, telefone, nif } = req.body;
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const user = req.user?.email || 'sistema';
        const userId = req.user?.id;
        try {
            if (!id_client) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Atualizar Cliente",
                    user,
                    user_id: userId,
                    details: "Tentativa de atualizar cliente sem ID",
                    ip,
                    resource: "clients",
                    duration,
                });
                return res.status(400).send({ message: "O campo id é obrigatório" });
            }
            const existingClient = await prismaclient_1.prisma.clients.findUnique({
                where: { id_client },
            });
            if (!existingClient) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Atualizar Cliente",
                    user,
                    user_id: userId,
                    details: `Cliente não encontrado para atualização. ID: ${id_client}`,
                    ip,
                    resource: "clients",
                    resource_id: id_client,
                    duration,
                });
                return res.status(404).send({ message: "Cliente não encontrado." });
            }
            // Montar lista de alterações para o log
            const alteracoes = [];
            if (existingClient.name !== name) {
                alteracoes.push(`Nome: "${existingClient.name}" → "${name}"`);
            }
            if (nif && existingClient.nif !== nif) {
                alteracoes.push(`NIF: "${existingClient.nif}" → "${nif}"`);
            }
            if (telefone && existingClient.telefone !== telefone) {
                alteracoes.push(`Telefone: "${existingClient.telefone}" → "${telefone}"`);
            }
            // Preparar os dados a atualizar
            const updateData = {
                name,
            };
            if (typeof nif === "string" && nif.trim() !== "") {
                updateData.nif = nif;
            }
            if (typeof telefone === "string" && telefone.trim() !== "") {
                updateData.telefone = telefone;
            }
            const client = await prismaclient_1.prisma.clients.update({
                where: { id_client },
                data: updateData,
            });
            const duration = Date.now() - startTime;
            // LOG DE SUCESSO COM ALTERAÇÕES DETALHADAS
            await logger_1.logger.success({
                action: "Atualizar Cliente",
                user,
                user_id: userId,
                details: `Cliente atualizado com sucesso. ` +
                    `ID: ${id_client} | ` +
                    (alteracoes.length > 0
                        ? `Alterações: ${alteracoes.join('; ')}`
                        : 'Nenhuma alteração detectada'),
                ip,
                resource: "clients",
                resource_id: id_client,
                duration,
            });
            return res.status(200).send(client);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Atualizar Cliente",
                user,
                user_id: userId,
                details: `Erro ao atualizar cliente ID ${id_client}: ${error.message}`,
                ip,
                resource: "clients",
                resource_id: id_client,
                duration,
            });
            console.error("Erro ao atualizar cliente:", error);
            return res.status(500).send({ error: "Erro interno do servidor" });
        }
    });
};
exports.UpdateClient = UpdateClient;
