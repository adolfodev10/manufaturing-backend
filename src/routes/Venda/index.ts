import { FastifyInstance } from "fastify";
import { CreateVenda } from "./create";
import { GetAllVenda } from "./get";

export async function VendaRoutes(app: FastifyInstance) {
    app.register(GetAllVenda);
    app.register(CreateVenda);
}