// import { FastifyInstance } from "fastify";
// import { ZodTypeProvider } from "fastify-type-provider-zod";
// import z from "zod";
// import { createCaixaSchema } from "../../modules/validations/caixa/caixa.schema";

// export const CreateCaixa = async (app: FastifyInstance) => {
//     app.withTypeProvider<ZodTypeProvider>().post("/caixa/create", {
//         schema: {
//             body: z.object({
//                 id: z.string().uuid(),
//                 status: z.enum(["ABERTA", "FECHADA"]),
//                 operador: z.enum(["ADMINISTRADOR", "OPERADOR", "GERENTE"]),
//                 operador_id: z.string().uuid(),
//                 data_abertura: z.date().optional(),
//                 data_fechadura: z.date().optional()
//             }),
//         },
//     },
//         async (req, reply) => {
//             const caixa = await createCaixaSchemaa(req.body);
//             return reply.status(201).send(caixa);
//         }
//     );
// };