"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNotificationByUserId = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const GetNotificationByUserId = async (app) => {
    app.withTypeProvider().get("/notification/:userId", {
        schema: {
            params: zod_1.default.object({
                userId: zod_1.default.string().uuid()
            })
        }
    }, async (request, reply) => {
        const { userId } = request.params;
        const notifications = await prismaclient_1.prisma.notification.findMany({
            where: {
                user_id: userId
            },
            orderBy: {
                created_at: "desc"
            }
        });
        if (!notifications) {
            return reply.status(404).send({
                message: "Notification not found"
            });
        }
        return reply.status(200).send(notifications);
    });
};
exports.GetNotificationByUserId = GetNotificationByUserId;
