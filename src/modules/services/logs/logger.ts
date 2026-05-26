import { api } from "../api/axios";

interface LogData {
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  action: string;
  user: string;
  user_id?: string;
  details: string;
  ip?: string;
  resource: string;
  resource_id?: string;
  old_value?: any;
  new_value?: any;
  duration?: number;
}

export const logger = {
  async info(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'INFO' });
  },

  async warning(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'WARNING' });
  },

  async error(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'ERROR' });
  },

  async success(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'SUCCESS' });
  },

  async log(data: LogData) {
    try {
      // Em produção, você pode querer fazer isso de forma assíncrona
      // para não bloquear a requisição principal
      await api.post('/logs/create', data);
    } catch (error) {
      console.error('Erro ao criar log:', error);
    }
  },

  // Versão síncrona para não esperar a resposta
  logSync(data: LogData) {
    api.post('/logs/create', data).catch(console.error);
  },
};



// src/modules/services/logs/logger.ts
// import { prisma } from "../../../lib/prismaclient";

// type LogLevel = "INFO" | "WARNING" | "ERROR" | "SUCCESS";

// interface LogData {
//   action: string;
//   user: string;
//   user_id?: string;
//   details: string;
//   ip?: string;
//   resource: string;
//   resource_id?: string;
//   old_value?: any;
//   new_value?: any;
//   duration?: number;
// }

// async function createLog(level: LogLevel, data: LogData) {
//   try {
//     const log = await prisma.logs.create({
//       data: {
//         level,
//         action: data.action,
//         user: data.user,
//         user_id: data.user_id,
//         details: data.details,
//         ip: data.ip || "0.0.0.0",
//         resource: data.resource,
//         resource_id: data.resource_id,
//         old_value: data.old_value ? JSON.stringify(data.old_value) : null,
//         new_value: data.new_value ? JSON.stringify(data.new_value) : null,
//         duration: data.duration || 0,
//         timestamp: new Date(),

//       },
//     });
//     return log;
//   } catch (error) {
//     console.error("Erro ao criar log:", error);
//     return null;
//   }
// }

// export const logger = {
//   info: (data: LogData) => createLog("INFO", data),
//   warning: (data: LogData) => createLog("WARNING", data),
//   error: (data: LogData) => createLog("ERROR", data),
//   success: (data: LogData) => createLog("SUCCESS", data),
// };