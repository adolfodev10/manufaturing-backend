"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const axios_1 = require("../api/axios");
exports.logger = {
    async info(data) {
        return this.log({ ...data, level: 'INFO' });
    },
    async warning(data) {
        return this.log({ ...data, level: 'WARNING' });
    },
    async error(data) {
        return this.log({ ...data, level: 'ERROR' });
    },
    async success(data) {
        return this.log({ ...data, level: 'SUCCESS' });
    },
    async log(data) {
        try {
            // Em produção, você pode querer fazer isso de forma assíncrona
            // para não bloquear a requisição principal
            await axios_1.api.post('/logs/create', data);
        }
        catch (error) {
            console.error('Erro ao criar log:', error);
        }
    },
    // Versão síncrona para não esperar a resposta
    logSync(data) {
        axios_1.api.post('/logs/create', data).catch(console.error);
    },
};
