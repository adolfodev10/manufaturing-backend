"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("./lib/fastify");
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const cors_1 = __importDefault(require("@fastify/cors"));
const root_route_1 = require("./routes/root-route");
const delete_1 = require("./routes/Client/delete");
const create_1 = require("./routes/Client/create");
const update_1 = require("./routes/Client/update");
const get_1 = require("./routes/Client/get");
const create_2 = require("./routes/User/create");
const get_2 = require("./routes/User/get");
const create_3 = require("./routes/Funcao/create");
const get_3 = require("./routes/Funcao/get");
const login_1 = require("./routes/Auth/login");
const validation_1 = require("./routes/Auth/validation");
const getFuncaoById_1 = require("./routes/Funcao/getFuncaoById");
const getFuncaoByName_1 = require("./routes/Funcao/getFuncaoByName");
const get_4 = require("./routes/Product/get");
const multipart_1 = __importDefault(require("@fastify/multipart"));
const getUserById_1 = require("./routes/User/getUserById");
const get_5 = require("./routes/Venda/get");
const create_4 = require("./routes/Product/create");
const create_5 = require("./routes/Venda/create");
const delete_2 = require("./routes/Stock/delete");
const create_6 = require("./routes/Stock/create");
const delete_3 = require("./routes/Product/delete");
const update_2 = require("./routes/Product/update");
const update_3 = require("./routes/Stock/update");
const update_4 = require("./routes/User/update");
const get_6 = require("./routes/Stock/get");
const delete_4 = require("./routes/User/delete");
const create_7 = require("./routes/Invoices/create");
const get_7 = require("./routes/Invoices/get");
const add_1 = require("./routes/Product/add");
const socket_1 = __importDefault(require("./plugins/socket"));
// import { startExpirationJob } from "./jobs/expired-products";
const app = fastify_1.fastify;
const port = Number(process.env.PORT) || 3300;
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
app.register(cors_1.default, {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://judyfarma.vercel.app',
        'https://judyfarma-support.vercel.app',
    ],
    credentials: true,
    methods: [
        "POST",
        "DELETE",
        "PUT",
        "PATCH",
        "OPTION"
    ]
});
app.register(multipart_1.default, {
    limits: {
        fieldNameSize: 100,
        fieldSize: 1024 * 1024 * 5,
        fields: 1000,
        fileSize: 1024 * 1024 * 50,
        files: 100,
        headerPairs: 2000,
        parts: 1000,
    },
    attachFieldsToBody: true,
});
// app.ready().then(()=> {
//   startExpirationJob(app);
// })
app.register(socket_1.default);
//Root Route
app.register(root_route_1.RootRoute);
//Funcao
app.register(create_3.CreateFuncao);
app.register(get_3.GetAllFuncao);
app.register(getFuncaoById_1.GetFuncaoById);
app.register(getFuncaoByName_1.GetFuncaoByName);
app.register(get_3.GetAllFuncaoNotAdmin);
//User
app.register(create_2.CreateUser);
app.register(get_2.GetUser);
app.register(getUserById_1.GetUserById);
app.register(update_4.UpdateUser);
app.register(delete_4.DeleteUser);
//Auth
app.register(login_1.Login);
app.register(validation_1.ValidationToken);
//Product
app.register(add_1.AddProductInStock);
app.register(get_4.GetAllProduct);
app.register(get_4.GetAllProductTheVenda);
app.register(create_4.CreateProduct);
app.register(delete_3.DeleteProduct);
app.register(update_2.EditProduct);
app.register(get_4.GetProfitByMonth);
//Stock
app.register(delete_2.deleteProduct);
app.register(create_6.CreateStockProduct);
app.register(update_3.EditStock);
app.register(get_6.GetAllProductStock);
//Venda
app.register(get_5.GetAllVenda);
app.register(create_5.CreateVenda);
//Client
app.register(create_1.CreateClient);
app.register(delete_1.DeleteClient);
app.register(update_1.UpdateClient);
app.register(get_1.GetClient);
//Invoice
app.register(create_7.CreateInvoice);
app.register(get_7.GetAllInvoice);
app.listen({ port, host: "0.0.0.0" }).then(() => console.log(`Servidor rodando na porta : ${port}`));
