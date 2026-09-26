import { FastifyInstance } from "fastify";
import { CreateMateriaPrima } from "./create";
import { GetMateriasPrimas } from "./get";
import { UpdateMateriaPrima } from "./update";
import { DeleteMateriaPrima } from "./delete";

export async function MateriasPrimasRoutes(app: FastifyInstance) {
    app.register(CreateMateriaPrima);
    app.register(GetMateriasPrimas);
    app.register(UpdateMateriaPrima);
    app.register(DeleteMateriaPrima);
}