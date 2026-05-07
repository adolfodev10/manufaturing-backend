"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFuncao = void 0;
const create_1 = require("../../modules/validations/funcao/create");
const prismaclient_1 = require("../../lib/prismaclient");
const CreateFuncao = async (app) => {
    app.withTypeProvider().post('/funcao/create', {
        schema: {
            body: create_1.createFuncaoSchema
        }
    }, async (req) => {
        const body = req.body;
        if (Array.isArray(body)) {
            const funcoes = await prismaclient_1.prisma.$transaction(body.map(funcao => prismaclient_1.prisma.funcao.create({
                data: {
                    name_funcao: funcao.name_funcao,
                    description: funcao.description,
                    ...(funcao.user && {
                        user: {
                            connect: {
                                id_user: funcao.user,
                            },
                        },
                    }),
                },
            })));
            return funcoes;
        }
        else {
            const { name_funcao, description, user } = body;
            const funcao = await prismaclient_1.prisma.funcao.create({
                data: {
                    name_funcao,
                    description,
                    ...(user && {
                        user: {
                            connect: {
                                id_user: user,
                            },
                        },
                    }),
                },
            });
            return funcao;
        }
    });
};
exports.CreateFuncao = CreateFuncao;
