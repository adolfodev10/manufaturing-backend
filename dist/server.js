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
const login_1 = require("./routes/Auth/login");
const validation_1 = require("./routes/Auth/validation");
const get_3 = require("./routes/Product/get");
const multipart_1 = __importDefault(require("@fastify/multipart"));
const getUserById_1 = require("./routes/User/getUserById");
const create_3 = require("./routes/Product/create");
const delete_2 = require("./routes/Product/delete");
const update_2 = require("./routes/Product/update");
const update_3 = require("./routes/User/update");
const delete_3 = require("./routes/User/delete");
const create_4 = require("./routes/Dividas/create");
const get_4 = require("./routes/Dividas/get");
const add_1 = require("./routes/Product/add");
const socket_1 = __importDefault(require("./plugins/socket"));
const delete_4 = require("./routes/Stock/delete");
const create_5 = require("./routes/Stock/create");
const update_4 = require("./routes/Stock/update");
const get_5 = require("./routes/Stock/get");
const get_6 = require("./routes/Venda/get");
const create_6 = require("./routes/Venda/create");
const delete_5 = require("./routes/Dividas/delete");
const getById_1 = require("./routes/Dividas/getById");
const update_5 = require("./routes/Dividas/update");
const create_7 = require("./routes/Logs/create");
const get_7 = require("./routes/Logs/get");
const getById_2 = require("./routes/Logs/getById");
const clear_1 = require("./routes/Logs/clear");
const delete_6 = require("./routes/Logs/delete");
const stats_1 = require("./routes/Logs/stats");
const get_8 = require("./routes/Backup/get");
const config_1 = require("./routes/Backup/config");
const stats_2 = require("./routes/Backup/stats");
const download_1 = require("./routes/Backup/download");
const create_8 = require("./routes/Backup/create");
const delete_7 = require("./routes/Backup/delete");
const create_9 = require("./routes/Permissoes/create");
const get_9 = require("./routes/Permissoes/get");
const getById_3 = require("./routes/Permissoes/getById");
const update_6 = require("./routes/Permissoes/update");
const delete_8 = require("./routes/Permissoes/delete");
const create_10 = require("./routes/Perfil/create");
const get_10 = require("./routes/Perfil/get");
const getByd_1 = require("./routes/Perfil/getByd");
const update_7 = require("./routes/Perfil/update");
const delete_9 = require("./routes/Perfil/delete");
const add_2 = require("./routes/Perfil/add");
const remove_1 = require("./routes/Perfil/remove");
const userByPerfil_1 = require("./routes/Perfil/userByPerfil");
const getById_4 = require("./routes/Notification/getById");
const create_11 = require("./routes/Fornecedores/create");
const get_11 = require("./routes/Fornecedores/get");
const getById_5 = require("./routes/Fornecedores/getById");
const update_8 = require("./routes/Fornecedores/update");
const delete_10 = require("./routes/Fornecedores/delete");
const Configuracoes_1 = require("./routes/Configuracoes");
const get_12 = require("./routes/Faturas/get");
const create_12 = require("./routes/Faturas/create");
const update_9 = require("./routes/Faturas/update");
// import { GetUserByFuncao } from "./routes/User/getUserByFuncao";
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
        'https://judy-farma.vercel.app',
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
//User
app.register(create_2.CreateUser);
app.register(get_2.GetUser);
app.register(getUserById_1.GetUserById);
app.register(update_3.UpdateUser);
app.register(delete_3.DeleteUser);
// app.register(GetUserByFuncao);
//Auth
app.register(login_1.Login);
app.register(validation_1.ValidationToken);
//Product
app.register(add_1.AddProductInStock);
app.register(get_3.GetAllProduct);
app.register(get_3.GetAllProductTheVenda);
app.register(create_3.CreateProduct);
app.register(delete_2.DeleteProduct);
app.register(update_2.EditProduct);
app.register(get_3.GetProfitByMonth);
//Notification
app.register(getById_4.GetNotificationByUserId);
//Stock
app.register(delete_4.deleteProduct);
app.register(create_5.CreateStockProduct);
app.register(update_4.EditStock);
app.register(get_5.GetAllProductStock);
// Venda
app.register(get_6.GetAllVenda);
app.register(create_6.CreateVenda);
//Client
app.register(create_1.CreateClient);
app.register(delete_1.DeleteClient);
app.register(update_1.UpdateClient);
app.register(get_1.GetClient);
// Divida
app.register(create_4.CreateDivida);
app.register(get_4.GetAllDivida);
app.register(delete_5.DeleteDivida);
app.register(getById_1.GetDividasByClientId);
app.register(update_5.UpdateDivida);
//Logs 
app.register(create_7.CreateLog);
app.register(get_7.GetLogs);
app.register(getById_2.GetLogById);
app.register(clear_1.ClearLogs);
app.register(delete_6.DeleteLog);
app.register(stats_1.GetLogsStats);
//Backup
app.register(get_8.GetBackups);
app.register(config_1.GetBackupConfig);
app.register(stats_2.GetBackupStats);
app.register(download_1.DownloadBackup);
app.register(config_1.SaveBackupConfig);
app.register(create_8.CreateBackup);
app.register(delete_7.DeleteBackup);
//Permissoes
app.register(create_9.CreatePermissao);
app.register(get_9.ListarPermissoes);
app.register(getById_3.BuscarPermissaoPorId);
app.register(update_6.AtualizarPermissao);
app.register(delete_8.DeletarPermissao);
// Faturas
app.register(get_12.GetAllFaturas);
app.register(get_12.GetFaturaById);
app.register(get_12.GetFaturaByNumero);
app.register(create_12.CreateFatura);
app.register(update_9.UpdateFatura);
//Perfil
app.register(create_10.CreatePerfil);
app.register(get_10.ListarPerfis);
app.register(getByd_1.BuscarPerfilPorId);
app.register(update_7.AtualizarPerfil);
app.register(delete_9.DeletarPerfil);
app.register(add_2.AtribuirPerfilUsuario);
app.register(remove_1.RemoverPerfilUsuario);
app.register(userByPerfil_1.ListarUsuariosPorPerfil);
//Fornecedores 
app.register(create_11.CreateFornecedor);
app.register(get_11.GetAllFornecedores);
app.register(getById_5.GetFornecedorById);
app.register(update_8.UpdateFornecedor);
app.register(delete_10.DeleteFornecedor);
// Configurações
app.register(Configuracoes_1.ConfiguracoesRoutes);
app.listen({ port, host: "0.0.0.0" }).then(() => console.log(`Servidor rodando na porta : ${port}`));
