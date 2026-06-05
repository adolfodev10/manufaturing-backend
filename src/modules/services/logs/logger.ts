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
  old_value?: unknown;
  new_value?: unknown;
  duration?: number;
}

const serializeValue = (value: unknown) => {
  if (value === undefined || value === null) {
    return null;
  }

  return typeof value === "string" ? value : JSON.stringify(value);
};

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
          ip: data.ip || null,
          resource: data.resource,
          resource_id: data.resource_id,
          old_value: serializeValue(data.old_value),
          new_value: serializeValue(data.new_value),
          duration: data.duration || null,
        },
      });
    } catch (error) {
      console.error("Erro ao criar log:", error);
    }
  },

  logSync(data: LogData) {
    void this.log(data);
  },
};
