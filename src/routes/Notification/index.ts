import { FastifyInstance } from "fastify";
import { GetNotificationByUserId } from "./getById";
import { UpdateNotification } from "./update";
import { GetEstoqueAlerts } from "./estoque-alerts";

export async function NotificationRoutes(app: FastifyInstance) {
    app.register(GetNotificationByUserId);
    app.register(UpdateNotification);
    app.register(GetEstoqueAlerts);
}