import { FastifyInstance } from "fastify";
import { GetUserById } from "./getUserById";
import { CreateUser } from "./create";
import { UpdateUser } from "./update";
import { DeleteUser } from "./delete";
import { GetUser } from "./get";

export async function UserRoutes(app: FastifyInstance) {
    app.register(CreateUser);
    app.register(GetUser);
    app.register(GetUserById);
    app.register(UpdateUser);
    app.register(DeleteUser);
}