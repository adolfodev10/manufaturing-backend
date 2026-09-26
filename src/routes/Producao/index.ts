import { FastifyInstance } from "fastify";
import { CreateProducao } from "./create";
import { GetProducoes } from "./get";

export async function ProducaoRoutes(app: FastifyInstance) {
    app.register(CreateProducao);
    app.register(GetProducoes);
}
