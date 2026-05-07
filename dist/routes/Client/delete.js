"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteClient = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const DeleteClient = async (app) => {
    app.withTypeProvider().delete('/client/delete/:id', {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().nonempty("O campo id é obrigatório."),
            }),
        },
    }, async (req, res) => {
        const { id } = req.params;
        const clients = await prismaclient_1.prisma.clients.findUnique({
            where: { id_client: id },
        });
        if (!clients) {
            return res.status(404).send({ message: 'Cliente não encontrado' });
        }
        await prismaclient_1.prisma.clients.delete({
            where: {
                id_client: id,
            },
        });
        return res.status(200).send({ message: "Cliente Eliminado com sucesso" });
    });
};
exports.DeleteClient = DeleteClient;
