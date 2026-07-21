"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProducoes = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const GetProducoes = async (app) => {
    app.get('/producao/getAll', async (request, reply) => {
        try {
            const producoes = await prismaclient_1.prisma.producoes.findMany({
                include: {
                    produto: true,
                    responsavel: {
                        select: {
                            id_user: true,
                            name: true,
                            email: true,
                        },
                    },
                    materiais: {
                        include: {
                            materia_prima: true,
                        },
                    },
                },
                orderBy: {
                    data_producao: 'desc',
                },
            });
            return { producoes };
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
};
exports.GetProducoes = GetProducoes;
