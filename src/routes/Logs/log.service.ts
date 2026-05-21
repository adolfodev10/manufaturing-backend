// src/services/logService.ts

import { prisma } from "../../lib/prismaclient";

type LogLevel = "INFO" | "WARNING" | "ERROR" | "SUCCESS";

interface LogData {
  level: LogLevel;
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

export async function createLog(data: LogData) {
  try {
    const log = await prisma.logs.create({
      data: {
        level: data.level,
        action: data.action,
        user: data.user,
        user_id: data.user_id,
        details: data.details,
        ip: data.ip || "0.0.0.0",
        resource: data.resource,
        resource_id: data.resource_id,
        old_value: data.old_value,
        new_value: data.new_value,
        duration: data.duration,
      },
    });
    return log;
  } catch (error) {
    console.error("Erro ao criar log:", error);
    return null;
  }
}