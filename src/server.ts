import dns from "node:dns";
import { fastify } from "./lib/fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import fastifyCors from "@fastify/cors";
import multipart from "@fastify/multipart";
import socketPlugin from "./plugins/socket";
import { authPlugin } from "./plugins/auth";

import { RootRoute } from './routes/root-route';
import { Routes } from "./routes";

const app = fastify;
const port = Number(process.env.PORT) || 3300;
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler);
dns.setDefaultResultOrder("ipv4first");


async function start() {
  await app.register(fastifyCors, {
      origin: (origin, cb) => {
        const allowedOrigins = process.env.CROSS_ORIGIN?.split(",") || [];
        if (!origin || allowedOrigins.includes(origin)) {
          cb(null, true);
          return;
        }
        cb(new Error("Not allowed by CORS"), false);
      },
      credentials: true,
    });

  app.register(multipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 1024 * 1024 * 5,
      fields: 1000,
      fileSize: 1024 * 1024 * 50,
      files: 100,
      headerPairs: 2000,
      parts: 1000,
    },
    attachFieldsToBody: true,
  });

  await app.register(socketPlugin);
  await app.register(authPlugin);

  //Root Route
  await app.register(RootRoute);

  await app.register(Routes);

  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Servidor rodando na porta : ${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
