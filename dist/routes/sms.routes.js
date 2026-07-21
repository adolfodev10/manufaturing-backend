"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsRoutes = SmsRoutes;
const sms_service_1 = require("../modules/services/sms.service");
async function SmsRoutes(app) {
    // Endpoint para enviar SMS de boas-vindas
    app.post('/sms/welcome', async (req, reply) => {
        const { telefone, name, email, password } = req.body;
        if (!telefone || !name || !password) {
            return reply.status(400).send({
                success: false,
                error: 'Dados incompletos. Envie: telefone, name, password'
            });
        }
        const result = await (0, sms_service_1.enviarSMSBoasVindas)({ telefone, name, email, password });
        if (result.success) {
            return reply.status(200).send({ success: true, message: 'SMS enviado com sucesso' });
        }
        else {
            return reply.status(500).send({ success: false, error: result.error });
        }
    });
    // Endpoint para enviar SMS de usuário criado (para o admin)
    app.post('/sms/usuario-criado', async (req, reply) => {
        const { telefone, name, email, password } = req.body;
        if (!telefone || !name || !password) {
            return reply.status(400).send({ success: false, error: 'Dados incompletos' });
        }
        const mensagem = (0, sms_service_1.gerarMensagemUsuarioCriado)({ name, email, password, telefone });
        const params = new URLSearchParams();
        params.append('api_key_app', process.env.SMS_API_KEY || '');
        params.append('phone_number', telefone.replace(/\D/g, ''));
        params.append('message_body', mensagem);
        params.append('sender', 'EKO SISTEMA');
        try {
            const axios = require('axios');
            const response = await axios.get('https://www.telcosms.co.ao/api/v2/send_message', { params });
            if (response.data?.status === 200) {
                return reply.status(200).send({ success: true });
            }
            return reply.status(500).send({ success: false });
        }
        catch (error) {
            return reply.status(500).send({ success: false, error: String(error) });
        }
    });
}
