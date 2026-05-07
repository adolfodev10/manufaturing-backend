import fp from "fastify-plugin";
import { Server as IOServer } from "socket.io";
import { FastifyInstance } from "fastify";


export default fp(async (fastify: FastifyInstance) => {
    const io = new IOServer(fastify.server, {
        cors: { origin: "*" }
    });


    fastify.decorate('io', io);
    io.on('connection', (socket) => {
        console.log('Administrador Conectado');
    });
});


declare module 'fastify' {
    interface FastifyInstance {
        io: IOServer;
    }
}