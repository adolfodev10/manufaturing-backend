"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllFuncaoNotAdmin = exports.GetAllFuncao = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const GetAllFuncao = async (app) => {
    app.withTypeProvider().get('/funcao/getAll', {}, async () => {
        const funcoes = await prismaclient_1.prisma.funcao.findMany();
        return { funcoes };
    });
};
exports.GetAllFuncao = GetAllFuncao;
const GetAllFuncaoNotAdmin = async (app) => {
    app.withTypeProvider().get('/funcao/getAllNotAdmin', {}, async () => {
        const funcoes = await prismaclient_1.prisma.funcao.findMany({
            where: {
                name_funcao: {
                    not: "ADMINISTRADOR"
                }
            }
        });
        return { funcoes };
    });
};
exports.GetAllFuncaoNotAdmin = GetAllFuncaoNotAdmin;
