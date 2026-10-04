import { FastifyInstance } from "fastify";
import { caixaRoutes } from "./caixa.routes";

export async function CaixaRoutes(app: FastifyInstance) {
    app.register(caixaRoutes);
}