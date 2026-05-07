"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClient = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const create_zodSchema_1 = require("../../modules/validations/client/create-zodSchema");
const CreateClient = async (app) => {
    app.withTypeProvider().post('/client/create', {
        schema: {
            body: create_zodSchema_1.createClientSchema
        },
    }, async (req, res) => {
        try {
            const { name, telefone } = req.body;
            const clientExists = await prismaclient_1.prisma.clients.findFirst({
                where: {
                    OR: [
                        { name },
                        { telefone }
                    ]
                }
            });
            if (clientExists) {
                return res.status(400).send({ error: 'Nome  ou telefone já existe' });
            }
            const newClient = await prismaclient_1.prisma.clients.create({
                data: {
                    name,
                    telefone: telefone ?? "",
                }
            });
            return res.status(201).send(newClient);
        }
        catch (error) {
            return res.status(400).send({ error: error.message });
        }
    });
};
exports.CreateClient = CreateClient;
