import { FastifyInstance } from "fastify";
import { GetBackups } from "./get";
import { GetBackupConfig, SaveBackupConfig } from "./config";
import { GetBackupStats } from "./stats";
import { DownloadBackup } from "./download";
import { CreateBackup } from "./create";
import { DeleteBackup } from "./delete";

export async function BackupRoutes(app: FastifyInstance) {
    app.register(GetBackups);
    app.register(GetBackupConfig);
    app.register(GetBackupStats);
    app.register(DownloadBackup);
    app.register(SaveBackupConfig);
    app.register(CreateBackup);
    app.register(DeleteBackup);
}