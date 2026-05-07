"use strict";
// import { FastifyInstance } from "fastify";
// import { ZodTypeProvider } from "fastify-type-provider-zod";
// import { z } from "zod";
// import { prisma } from "../../lib/prismaclient";
// export const GetUserByFuncao = async (app:FastifyInstance) => {
//     app.withTypeProvider<ZodTypeProvider>().get('/user/funcao/:funcao', {
//         schema:{
//             body:z.object({
//                 name_funcao: z.string(),
//             })
//         }
//     },
//     async(req, res) => {
//         const {name_funcao} = req.body;
//         const user = await prisma.users.findUnique({
//             where:{
//                 funcao:{
//                     name_funcao : "FARMACÊUTICO(A)"
//                 },
//             }
//         })
//     }
// )
// }
