"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProducao = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const CreateProducao = async (app) => {
    app.withTypeProvider().post('/producao/create', {
        schema: {
            body: zod_1.default.object({
                produto_id: zod_1.default.string(),
                quantidade_litros: zod_1.default.number(),
                responsavel_id: zod_1.default.string(),
                materias_primas: zod_1.default.array(zod_1.default.object({
                    materia_prima_id: zod_1.default.string(),
                    quantidade: zod_1.default.number(),
                    unidade: zod_1.default.string().default("KG"),
                })),
                observacoes: zod_1.default.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const data = request.body;
        try {
            // Criar produção
            const producao = await prismaclient_1.prisma.producoes.create({
                data: {
                    produto_id: data.produto_id,
                    quantidade: data.quantidade_litros,
                    unidade: "LITROS",
                    responsavel_id: data.responsavel_id,
                    observacoes: data.observacoes,
                    materiais: {
                        create: data.materias_primas.map(mp => ({
                            materia_prima_id: mp.materia_prima_id,
                            quantidade: mp.quantidade,
                            unidade: mp.unidade,
                        })),
                    },
                },
                include: {
                    produto: true,
                    responsavel: true,
                    materiais: {
                        include: {
                            materia_prima: true,
                        },
                    },
                },
            });
            // Dar baixa nas matérias-primas
            for (const mp of data.materias_primas) {
                await prismaclient_1.prisma.materiasPrimas.update({
                    where: { id: mp.materia_prima_id },
                    data: {
                        quantidade_atual: {
                            decrement: mp.quantidade,
                        },
                    },
                });
            }
            return reply.status(201).send(producao);
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
};
exports.CreateProducao = CreateProducao;
