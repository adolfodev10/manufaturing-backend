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
import { SmsRoutes } from "./routes/sms.routes";
import { CreateProducao } from "./routes/Producao/create";
import { GetProducoes } from "./routes/Producao/get";
import { CreateMateriaPrima } from "./routes/MateriasPrimas/create";
import { GetMateriasPrimas } from "./routes/MateriasPrimas/get";
import { UpdateMateriaPrima } from "./routes/MateriasPrimas/update";
import { DeleteMateriaPrima } from "./routes/MateriasPrimas/delete";
import { CreateFormula } from "./routes/Formulas/create";
import { GetFormulas } from "./routes/Formulas/get";
import { DeleteFormula } from "./routes/Formulas/delete";
import { ForgotPassword } from "./routes/Auth/forgot-password";
import { ResetPassword } from "./routes/Auth/reset-password";
import { GetEstoqueAlerts } from "./routes/Notification/estoque-alerts";
import { GetFaturaByOperador } from "./routes/Faturas/getFaturaByOperator";
import { GetProximoNumero } from "./routes/Faturas/getProximoNumero";
import { caixaRoutes } from "./routes/Caixa/caixa.routes";
import { authPlugin } from "./plugins/auth";


const app = fastify;
const port = Number(process.env.PORT) || 3300;
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler);


async function start() {
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

await app.register(socketPlugin);

//Root Route
await app.register(RootRoute);


//Auth
await app.register(Login);
await app.register(ValidationToken);
await app.register(ForgotPassword);
await app.register(ResetPassword);

await app.register(authPlugin);

  //User
  await app.register(CreateUser);
  await app.register(GetUser);
  await app.register(GetUserById);
  await app.register(UpdateUser);
  await app.register(DeleteUser);
  // app.register(GetUserByFuncao);


  //Product
  await app.register(AddProductInStock);
  await app.register(GetAllProduct);
  await app.register(GetAllProductTheVenda);
  await app.register(CreateProduct)
  await app.register(DeleteProduct);
  await app.register(EditProduct);
  await app.register(GetProfitByMonth)

  //Notification
  await app.register(GetNotificationByUserId);
  await app.register(GetEstoqueAlerts);

  //Stock
  await app.register(deleteProduct);
  await app.register(CreateStockProduct);
  await app.register(EditStock);
  await app.register(GetAllProductStock);

  // Venda
  await app.register(GetAllVenda);
  await app.register(CreateVenda)

  //Client
  await app.register(CreateClient);
  await app.register(DeleteClient);
  await app.register(UpdateClient);
  await app.register(GetClient);

  // Divida
  await app.register(CreateDivida);
  await app.register(GetAllDivida);
  await app.register(DeleteDivida);
  await app.register(GetDividasByClientId);
  await app.register(UpdateDivida);

  //Logs 
  await app.register(CreateLog);
  await app.register(GetLogs);
  await app.register(GetLogById);
  await app.register(ClearLogs);
  await app.register(DeleteLog);
  await app.register(GetLogsStats);

  //Backup
  await app.register(GetBackups);
  await app.register(GetBackupConfig);
  await app.register(GetBackupStats);
  await app.register(DownloadBackup);
  await app.register(SaveBackupConfig);
  await app.register(CreateBackup);
  await app.register(DeleteBackup);

  //Permissoes
  await app.register(CreatePermissao);
  await app.register(ListarPermissoes);
  await app.register(BuscarPermissaoPorId);
  await app.register(AtualizarPermissao);
  await app.register(DeletarPermissao);

  // Faturas
  await app.register(GetAllFaturas);
  await app.register(GetFaturaById);
  await app.register(GetFaturaByNumero);
  await app.register(CreateFatura);
  await app.register(UpdateFatura);
  await app.register(GetFaturaByOperador);
  await app.register(GetProximoNumero);

  //Perfil
  await app.register(CreatePerfil);
  await app.register(ListarPerfis);
  await app.register(BuscarPerfilPorId);
  await app.register(AtualizarPerfil);
  await app.register(DeletarPerfil);
  await app.register(AtribuirPerfilUsuario);
  await app.register(RemoverPerfilUsuario);
  await app.register(ListarUsuariosPorPerfil);

  //Fornecedores 
  await app.register(CreateFornecedor);
  await app.register(GetAllFornecedores);
  await app.register(GetFornecedorById);
  await app.register(UpdateFornecedor);
  await app.register(DeleteFornecedor);

  // Configurações
  await app.register(ConfiguracoesRoutes);

  // Producao
  await app.register(CreateProducao);
  await app.register(GetProducoes);

  // Matérias-Primas
  await app.register(CreateMateriaPrima);
  await app.register(GetMateriasPrimas);
  await app.register(UpdateMateriaPrima);
  await app.register(DeleteMateriaPrima);

  // Fórmulas
  await app.register(CreateFormula);
  await app.register(GetFormulas);
  await app.register(DeleteFormula);

  // Caixa
  await app.register(caixaRoutes);

  // Email
  await app.register(SmsRoutes);

  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Servidor rodando na porta : ${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});