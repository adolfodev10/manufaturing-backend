"use strict";
// // Para Prisma 7, a configuração é diferente
// // Não use defineConfig diretamente do @prisma/client
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// // Opção 1: Configuração simples para MySQL
// export default {
//   adapter: 'mysql',
//   url: process.env.DATABASE_URL,
//   // Configurações opcionais
//   connectionLimit: 10,
//   // Logs
//   log: process.env.NODE_ENV === 'development' 
//     ? ['query', 'error', 'warn', 'info'] 
//     : ['error'],
//   // Outras opções comuns
//   transactionOptions: {
//     maxWait: 5000,
//     timeout: 10000,
//   }
// };
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
