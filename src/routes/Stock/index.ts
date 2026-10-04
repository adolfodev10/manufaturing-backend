import { FastifyInstance } from "fastify";
import { CreateStockProduct } from "./create";
import { deleteProduct } from "./delete";
import { EditStock } from "./update";
import { GetAllProductStock } from "./get";

export async function StockRoutes(app: FastifyInstance) {
    app.register(deleteProduct);
    app.register(CreateStockProduct);
    app.register(EditStock);
    app.register(GetAllProductStock);
}