import { prisma } from "../../../lib/prismaclient";

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
  async info(data: Omit<LogData, "level">) {
    return this.log({ ...data, level: "INFO" });
  },

  async warning(data: Omit<LogData, "level">) {
    return this.log({ ...data, level: "WARNING" });
  },

  async error(data: Omit<LogData, "level">) {
    return this.log({ ...data, level: "ERROR" });
  },

  async success(data: Omit<LogData, "level">) {
    return this.log({ ...data, level: "SUCCESS" });
  },

  async log(data: LogData) {
    try {
      await prisma.logs.create({
        data: {
          level: data.level,
          action: data.action,
          user: data.user,
          user_id: data.user_id,
          details: data.details,
          ip: data.ip,
          resource: data.resource,
          resource_id: data.resource_id,
          old_value:
            typeof data.old_value === "string"
              ? data.old_value
              : data.old_value
                ? JSON.stringify(data.old_value)
                : null,
          new_value:
            typeof data.new_value === "string"
              ? data.new_value
              : data.new_value
                ? JSON.stringify(data.new_value)
                : null,
          duration: data.duration,
        },
      });
    } catch (error) {
      console.error("Erro ao criar log:", error);
    }
  },

  logSync(data: LogData) {
    this.log(data).catch(console.error);
  },
};