import { fastify } from "./lib/fastify";

import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import fastifyCors from "@fastify/cors";

import { RootRoute } from './routes/root-route';
import { DeleteClient } from './routes/Client/delete';
import { CreateClient } from './routes/Client/create';
import { UpdateClient } from './routes/Client/update';
import { GetClient } from "./routes/Client/get";
import { CreateUser } from "./routes/User/create";
import { GetUser } from "./routes/User/get";
import { Login } from "./routes/Auth/login";
import { ValidationToken } from "./routes/Auth/validation";
import { GetAllProduct, GetAllProductTheVenda, GetProfitByMonth } from "./routes/Product/get";
import multipart from "@fastify/multipart";
import { GetUserById } from "./routes/User/getUserById";
import { CreateProduct } from "./routes/Product/create";
import { DeleteProduct } from "./routes/Product/delete";
import { EditProduct } from "./routes/Product/update";
import { UpdateUser } from "./routes/User/update";
import { DeleteUser } from "./routes/User/delete";
import { CreateDivida } from "./routes/Dividas/create";
import { GetAllDivida } from "./routes/Dividas/get";
import { AddProductInStock } from "./routes/Product/add";
import socketPlugin from "./plugins/socket";
import { deleteProduct } from "./routes/Stock/delete";
import { CreateStockProduct } from "./routes/Stock/create";
import { EditStock } from "./routes/Stock/update";
import { GetAllProductStock } from "./routes/Stock/get";
import { GetAllVenda } from "./routes/Venda/get";
import { CreateVenda } from "./routes/Venda/create";
import { DeleteDivida } from "./routes/Dividas/delete";
import { GetDividasByClientId } from "./routes/Dividas/getById";
import { UpdateDivida } from "./routes/Dividas/update";
import { CreateLog } from "./routes/Logs/create";
import { GetLogs } from "./routes/Logs/get";
import { GetLogById } from "./routes/Logs/getById";
import { ClearLogs } from "./routes/Logs/clear";
import { DeleteLog } from "./routes/Logs/delete";
import { GetLogsStats } from "./routes/Logs/stats";
import { GetBackups } from "./routes/Backup/get";
import { GetBackupConfig, SaveBackupConfig } from "./routes/Backup/config";
import { GetBackupStats } from "./routes/Backup/stats";
import { DownloadBackup } from "./routes/Backup/download";
import { CreateBackup } from "./routes/Backup/create";
import { DeleteBackup } from "./routes/Backup/delete";
import { CreatePermissao } from "./routes/Permissoes/create";
import { ListarPermissoes } from "./routes/Permissoes/get";
import { BuscarPermissaoPorId } from "./routes/Permissoes/getById";
import { AtualizarPermissao } from "./routes/Permissoes/update";
import { DeletarPermissao } from "./routes/Permissoes/delete";
import { CreatePerfil } from "./routes/Perfil/create";
import { ListarPerfis } from "./routes/Perfil/get";
import { BuscarPerfilPorId } from "./routes/Perfil/getByd";
import { AtualizarPerfil } from "./routes/Perfil/update";
import { DeletarPerfil } from "./routes/Perfil/delete";
import { AtribuirPerfilUsuario } from "./routes/Perfil/add";
import { RemoverPerfilUsuario } from "./routes/Perfil/remove";
import { ListarUsuariosPorPerfil } from "./routes/Perfil/userByPerfil";
import { GetNotificationByUserId } from "./routes/Notification/getById";
import { CreateFornecedor } from "./routes/Fornecedores/create";
import { GetAllFornecedores } from "./routes/Fornecedores/get";
import { GetFornecedorById } from "./routes/Fornecedores/getById";
import { UpdateFornecedor } from "./routes/Fornecedores/update";
import { DeleteFornecedor } from "./routes/Fornecedores/delete";
import { ConfiguracoesRoutes } from "./routes/Configuracoes";
import { GetAllFaturas, GetFaturaById, GetFaturaByNumero } from "./routes/Faturas/get";
import { CreateFatura } from "./routes/Faturas/create";
import { UpdateFatura } from "./routes/Faturas/update";
import { SendWelcomeEmailRoute } from "./routes/Email/sendWelcome";

// import { GetUserByFuncao } from "./routes/User/getUserByFuncao";

const app = fastify;
const port = Number(process.env.PORT) || 3300;
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://judy-farma.vercel.app',
    'https://judyfarma-support.vercel.app',
    'https://eko-manufaturing.vercel.app',
    'https://manufaturing-backend.onrender.com'
  ],
  credentials: true,
  methods: [
    "POST",
    "DELETE",
    "PUT",
    "PATCH",
    "OPTION",
    "GET",
  ]
});

app.register(multipart, {
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

app.register(socketPlugin);

//Root Route

app.register(RootRoute);

//User
app.register(CreateUser);
app.register(GetUser);
app.register(GetUserById);
app.register(UpdateUser);
app.register(DeleteUser);
// app.register(GetUserByFuncao);

//Auth
app.register(Login);
app.register(ValidationToken);

//Product
app.register(AddProductInStock);
app.register(GetAllProduct);
app.register(GetAllProductTheVenda);
app.register(CreateProduct)
app.register(DeleteProduct);
app.register(EditProduct);
app.register(GetProfitByMonth)

//Notification
app.register(GetNotificationByUserId);

//Stock
app.register(deleteProduct);
app.register(CreateStockProduct);
app.register(EditStock);
app.register(GetAllProductStock);

// Venda
app.register(GetAllVenda);
app.register(CreateVenda)

//Client
app.register(CreateClient);
app.register(DeleteClient);
app.register(UpdateClient);
app.register(GetClient);

// Divida
app.register(CreateDivida);
app.register(GetAllDivida);
app.register(DeleteDivida);
app.register(GetDividasByClientId);
app.register(UpdateDivida);

//Logs 
app.register(CreateLog);
app.register(GetLogs);
app.register(GetLogById);
app.register(ClearLogs);
app.register(DeleteLog);
app.register(GetLogsStats);

//Backup
app.register(GetBackups);
app.register(GetBackupConfig);
app.register(GetBackupStats);
app.register(DownloadBackup);
app.register(SaveBackupConfig);
app.register(CreateBackup);
app.register(DeleteBackup);

//Permissoes
app.register(CreatePermissao);
app.register(ListarPermissoes);
app.register(BuscarPermissaoPorId);
app.register(AtualizarPermissao);
app.register(DeletarPermissao);


// Faturas

app.register(GetAllFaturas);
app.register(GetFaturaById);
app.register(GetFaturaByNumero);
app.register(CreateFatura);
app.register(UpdateFatura);


//Perfil

app.register(CreatePerfil);
app.register(ListarPerfis);
app.register(BuscarPerfilPorId);
app.register(AtualizarPerfil);
app.register(DeletarPerfil);
app.register(AtribuirPerfilUsuario);
app.register(RemoverPerfilUsuario);
app.register(ListarUsuariosPorPerfil);

//Fornecedores 

app.register(CreateFornecedor);
app.register(GetAllFornecedores);
app.register(GetFornecedorById);
app.register(UpdateFornecedor);
app.register(DeleteFornecedor);

// Configurações

app.register(ConfiguracoesRoutes);


// Email
app.register(SendWelcomeEmailRoute);


app.listen({ port, host: "0.0.0.0" }).then(() => console.log(`Servidor rodando na porta : ${port}`))