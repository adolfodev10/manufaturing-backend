"use strict";
// import { FastifyInstance } from "fastify";
// import cron from "node-cron"
// import { prisma } from "../lib/prismaclient";
// export function startExpirationJob(fastify: FastifyInstance) {
//     cron.schedule("0 22 * * *", async () => {
//         const expirados = await prisma.products.findMany({
//             where: {
//                 date_validate: {
//                     // lt: new Date() ??  "" ?? undefined
//                 },
//                 status: "NAO_VENDIDO",
//             },
//         });
//         if (expirados.length) {
//             expirados.forEach((p) => {
//                fastify.io.emit("admin_notification", {
//                     type: "expirado",
//                     title: "Produto expirado",
//                     message: `O produto ${p.name_product} venceu em ${new Date(p.date_validate).toLocaleDateString("pt-AO")}`,
//                     productId: p.id_product
//                 });
//             });
//         }
//     });
// }
