import { FastifyInstance } from "fastify";
import { CreateLog } from "./create";
import { GetLogs } from "./get";
import { GetLogById } from "./getById";
import { ClearLogs } from "./clear";
import { DeleteLog } from "./delete";
import { GetLogsStats } from "./stats";

export async function LogsRoutes(app: FastifyInstance) {
    app.register(CreateLog);
    app.register(GetLogs);
    app.register(GetLogById);
    app.register(ClearLogs);
    app.register(DeleteLog);
    app.register(GetLogsStats);
}