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
      await api.post('/logs/create', data);
    } catch (error) {
      console.error('Erro ao criar log:', error);
    }
  },

  logSync(data: LogData) {
    api.post('/logs/create', data).catch(console.error);
  },
};
