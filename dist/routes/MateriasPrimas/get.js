"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMateriasPrimas = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const GetMateriasPrimas = async (app) => {
    app.get('/materias-primas/getAll', async (request, reply) => {
        try {
            const materias = await prismaclient_1.prisma.materiasPrimas.findMany({
                orderBy: {
                    nome: 'asc',
                },
            });
            return { materias };
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
};
exports.GetMateriasPrimas = GetMateriasPrimas;
