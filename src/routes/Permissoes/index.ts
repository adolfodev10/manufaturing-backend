import { FastifyInstance } from "fastify";
import { CreatePermissao } from "./create";
import { ListarPermissoes } from "./get";
import { BuscarPermissaoPorId } from "./getById";
import { AtualizarPermissao } from "./update";
import { DeletarPermissao } from "./delete";

export async function PermissoesRoutes(app: FastifyInstance) {
    app.register(CreatePermissao);
    app.register(ListarPermissoes);
    app.register(BuscarPermissaoPorId);
    app.register(AtualizarPermissao);
    app.register(DeletarPermissao);
}