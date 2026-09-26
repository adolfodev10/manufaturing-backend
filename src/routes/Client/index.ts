import { FastifyInstance } from "fastify";
import { CreateClient } from "./create";
import { DeleteClient } from "./delete";
import { GetClient } from "./get";
import { UpdateClient } from "./update";

export async function ClientRoutes(app: FastifyInstance) {
    app.register(CreateClient);
    app.register(GetClient);
    app.register(UpdateClient);
    app.register(DeleteClient);
}