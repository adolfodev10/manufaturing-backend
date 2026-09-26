import { FastifyInstance } from "fastify";
import { CreateFormula } from "./create";
import { GetFormulas } from "./get";
import { DeleteFormula } from "./delete";

export async function FormulasRoutes(app: FastifyInstance) {
    app.register(CreateFormula);
    app.register(GetFormulas);
    app.register(DeleteFormula);
}
