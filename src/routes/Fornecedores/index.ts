import { FastifyInstance } from "fastify";
import { CreateFornecedor } from "./create";
import { GetAllFornecedores } from "./get";
import { GetFornecedorById } from "./getById";
import { UpdateFornecedor } from "./update";
import { DeleteFornecedor } from "./delete";
import { CreatePedidoCompra } from "./pedidos";

export async function FornecedoresRoutes(app: FastifyInstance) {
    app.register(CreateFornecedor);
    app.register(GetAllFornecedores);
    app.register(GetFornecedorById);
    app.register(UpdateFornecedor);
    app.register(DeleteFornecedor);
    app.register(CreatePedidoCompra);
}
