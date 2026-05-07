"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFuncaoByName = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const GetFuncaoByName = async (app) => {
    app.withTypeProvider().get("/funcao/getByName/:name", {
        schema: {
            params: zod_1.z.object({
                name: zod_1.z.string()
            })
        }
    }, async (request) => {
        const { name } = request.params;
        const funcao = await prismaclient_1.prisma.funcao.findFirst({
            where: {
                name_funcao: name,
            }
        });
        return funcao?.id_funcao;
    });
};
exports.GetFuncaoByName = GetFuncaoByName;
