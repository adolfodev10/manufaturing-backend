"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFatura = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const zod_1 = __importDefault(require("zod"));
const updateFaturaSchema = zod_1.default.object({
    status: zod_1.default.enum(["EMITIDA", "PAGA", "CANCELADA"]).optional(),
    statusAGT: zod_1.default.enum(["PENDENTE", "ENVIADO", "ERRO"]).optional(),
    hashFiscal: zod_1.default.string().optional(),
    qrCodeData: zod_1.default.string().optional(),
    codigoValidacao: zod_1.default.string().optional(),
});
const UpdateFatura = async (app) => {
    app.withTypeProvider().put("/fatura/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
            body: updateFaturaSchema,
        },
    }, async (req, res) => {
        const startTime = Date.now();
        const { id } = req.params;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.name || "sistema";
        const userId = req.user?.id;
        try {
            const faturaExistente = await prismaclient_1.prisma.faturas.findUnique({
                where: { id_fatura: id },
            });
            if (!faturaExistente) {
                return res.status(404).send({
                    success: false,
                    message: "Fatura não encontrada",
                });
            }
            const fatura = await prismaclient_1.prisma.faturas.update({
                where: { id_fatura: id },
                data: req.body,
                include: {
                    itens: true,
                },
            });
            const duration = Date.now() - startTime;
            logger_1.logger.success({
                action: "Atualizar Fatura",
                user,
                user_id: userId,
                details: `Fatura ${fatura.numero} atualizada`,
                ip,
                resource: "faturas",
                resource_id: id,
                old_value: JSON.stringify(faturaExistente),
                new_value: JSON.stringify(req.body),
                duration,
            });
            return res.status(200).send({
                success: true,
                data: fatura,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.logger.error({
                action: "Atualizar Fatura",
                user,
                user_id: userId,
                details: `Erro ao atualizar fatura: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                ip,
                resource: "faturas",
                resource_id: id,
                duration,
            });
            return res.status(500).send({
                success: false,
                message: "Erro ao atualizar fatura",
            });
        }
    });
};
exports.UpdateFatura = UpdateFatura;
