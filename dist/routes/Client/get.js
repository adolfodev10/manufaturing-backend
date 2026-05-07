"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetClient = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const GetClient = async (app) => {
    app.withTypeProvider().get("/client/getAll", {}, async (req, res) => {
        const client = await prismaclient_1.prisma.clients.findMany({
            select: {
                id_client: true,
                name: true,
                telefone: true,
            },
        });
        const response = client.map(client => ({
            id: client.id_client,
            name: client.name,
            telefone: client.telefone,
        }));
        return res.status(200).send(client);
    });
};
exports.GetClient = GetClient;
