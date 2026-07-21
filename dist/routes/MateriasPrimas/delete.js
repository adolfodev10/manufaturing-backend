"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMateriaPrima = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const DeleteMateriaPrima = async (app) => {
    app.withTypeProvider().delete('/materias-primas/delete/:id', {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        try {
            await prismaclient_1.prisma.materiasPrimas.delete({
                where: { id },
            });
            return reply.status(204).send();
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
};
exports.DeleteMateriaPrima = DeleteMateriaPrima;
