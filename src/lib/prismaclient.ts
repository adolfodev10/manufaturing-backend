// // Para Prisma 7, a configuração é diferente
// // Não use defineConfig diretamente do @prisma/client

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

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();