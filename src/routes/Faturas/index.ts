import { FastifyInstance } from "fastify";
import { CreateFatura } from "./create";
import { GetAllFaturas, GetFaturaById, GetFaturaByNumero } from "./get";
import { UpdateFatura } from "./update";
import { GetFaturaByOperador } from "./getFaturaByOperator";
import { GetProximoNumero } from "./getProximoNumero";
import { CancelarFatura } from "./cancelar";
import { EmitirFatura } from "./emitir";

export async function FaturasRoutes(app: FastifyInstance) {
    app.register(CreateFatura);
    app.register(GetAllFaturas);
    app.register(GetFaturaById);
    app.register(GetFaturaByNumero);
    app.register(UpdateFatura);
    app.register(GetFaturaByOperador);
    app.register(GetProximoNumero);
    app.register(CancelarFatura);
    app.register(EmitirFatura);
}