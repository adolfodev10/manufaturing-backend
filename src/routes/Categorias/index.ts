import { FastifyInstance } from "fastify";
import { CreateCategoria } from "./create";
import { GetCategorias } from "./get";
import { UpdateCategoria } from "./update";
import { DeleteCategoria } from "./delete";

export async function CategoriasRoutes(app: FastifyInstance) {
    app.register(CreateCategoria);
    app.register(GetCategorias);
    app.register(UpdateCategoria);
    app.register(DeleteCategoria);
}