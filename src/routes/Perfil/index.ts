import { FastifyInstance } from "fastify";
import { CreatePerfil } from "./create";
import { ListarPerfis } from "./get";
import { BuscarPerfilPorId } from "./getByd";
import { AtualizarPerfil } from "./update";
import { DeletarPerfil } from "./delete";
import { AtribuirPerfilUsuario } from "./add";
import { RemoverPerfilUsuario } from "./remove";
import { ListarUsuariosPorPerfil } from "./userByPerfil";

export async function PerfilRoutes(app: FastifyInstance) {
    app.register(CreatePerfil);
    app.register(ListarPerfis);
    app.register(BuscarPerfilPorId);
    app.register(AtualizarPerfil);
    app.register(DeletarPerfil);
    app.register(AtribuirPerfilUsuario);
    app.register(RemoverPerfilUsuario);
    app.register(ListarUsuariosPorPerfil);
}