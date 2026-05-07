"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClient = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const UpdateClient = async (app) => {
    app.withTypeProvider().put("/client/update/:id_client", {
        schema: {
            params: zod_1.default.object({
                id_client: zod_1.default.string().uuid(),
            }),
            body: zod_1.default.object({
                name: zod_1.default.string(),
                telefone: zod_1.default.string()
                    .optional(),
            }),
        },
    }, async (req, res) => {
        const { id_client } = req.params;
        const { name, telefone } = req.body;
        if (!id_client) {
            return res
                .status(400)
                .send({ message: "O campo id é obrigatório" });
        }
        const existingClient = await prismaclient_1.prisma.clients.findUnique({
            where: { id_client },
        });
        if (!existingClient) {
            return res
                .status(404)
                .send({ message: "Cliente não encontrado." });
        }
        // Prepara os dados a atualizar
        const updateData = {
            name,
        };
        if (typeof telefone === "string" && telefone.trim() !== "") {
            updateData.telefone = telefone;
        }
        const client = await prismaclient_1.prisma.clients.update({
            where: { id_client },
            data: updateData,
        });
        return res.status(200).send(client);
    });
};
exports.UpdateClient = UpdateClient;
