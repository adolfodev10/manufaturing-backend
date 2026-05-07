"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const socket_io_1 = require("socket.io");
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    const io = new socket_io_1.Server(fastify.server, {
        cors: { origin: "*" }
    });
    fastify.decorate('io', io);
    io.on('connection', (socket) => {
        console.log('Administrador Conectado');
    });
});
