import { FastifyInstance } from "fastify";
import { CreateDivida } from "./create";
import { GetAllDivida } from "./get";
import { DeleteDivida } from "./delete";
import { GetDividasByClientId } from "./getById";
import { UpdateDivida } from "./update";

export async function DividasRoutes(app: FastifyInstance) {
    app.register(CreateDivida);
    app.register(GetAllDivida);
    app.register(DeleteDivida);
    app.register(GetDividasByClientId);
    app.register(UpdateDivida);
}