"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFuncaoById = void 0;
const zod_1 = require("zod");
const prismaclient_1 = require("../../lib/prismaclient");
const GetFuncaoById = async (app) => {
    app.withTypeProvider().get('/funcao/:id', {
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string().uuid(),
            })
        }
    }, async (request) => {
        const { id } = request.params;
        const funcao = await prismaclient_1.prisma.funcao.findUnique({
            where: {
                id_funcao: id,
            },
        });
        if (!funcao) {
            throw new Error('Funcao not found');
        }
        return { funcao };
    });
};
exports.GetFuncaoById = GetFuncaoById;
