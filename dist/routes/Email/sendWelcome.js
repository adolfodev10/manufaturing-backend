"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendWelcomeEmailRoute = void 0;
const emailService_1 = require("../../modules/services/email/emailService");
const SendWelcomeEmailRoute = async (app) => {
    app.post('/email/welcome', async (req, reply) => {
        const { to, name, password } = req.body;
        const success = await (0, emailService_1.sendWelcomeEmail)(to, name, password);
        return reply.send({ success });
    });
};
exports.SendWelcomeEmailRoute = SendWelcomeEmailRoute;
