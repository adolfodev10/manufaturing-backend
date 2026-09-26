import { GetAllProduct, GetAllProductTheVenda, GetProfitByMonth } from "./get";
import { AddProductInStock } from "./add";
import { FastifyInstance } from "fastify";
import { CreateProduct } from "./create";
import { DeleteProduct } from "./delete";
import { EditProduct } from "./update";

export async function ProductRoutes(app: FastifyInstance) {
    app.register(AddProductInStock);
    app.register(GetAllProduct);
    app.register(GetAllProductTheVenda);
    app.register(CreateProduct);
    app.register(DeleteProduct);
    app.register(EditProduct);
    app.register(GetProfitByMonth);

}
