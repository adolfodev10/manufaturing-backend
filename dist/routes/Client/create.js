"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClient = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const crypto_1 = require("crypto");
const CreateClient = async (app) => {
    app.withTypeProvider().post("/client/create", {
        schema: {
            body: zod_1.default.object({
                name: zod_1.default.string().min(1, "Nome é obrigatório"),
                telefone: zod_1.default.string().optional(),
                nif: zod_1.default.string().optional(),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { name, telefone, nif } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id_user;
        try {
            // Verificar se já existe cliente com mesmo NIF (se fornecido)
            if (nif) {
                const existingClient = await prismaclient_1.prisma.clients.findFirst({
                    where: { nif }
                });
                if (existingClient) {
                    const duration = Date.now() - startTime;
                    await logger_1.logger.warning({
                        action: "Criar Cliente",
                        user,
                        user_id: userId,
                        details: `Tentativa de criar cliente com NIF duplicado: ${nif}`,
                        ip,
                        resource: "clients",
                        duration,
                    });
                    return reply.status(409).send({
                        message: "Já existe um cliente com este NIF"
                    });
                }
            }
            const client = await prismaclient_1.prisma.clients.create({
                data: {
                    name,
                    telefone: telefone || "",
                    nif: nif || "",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            console.log("🧶🧶🧶Cliente: ", client);
            let usersToNotify = [];
            if (userId) {
                const admins = await prismaclient_1.prisma.users.findMany({
                    where: {
                        role: { in: ["ADMINISTRADOR", "GERENTE"] },
                        user_status: "ACTIVO"
                    },
                    select: { id_user: true }
                });
                usersToNotify = admins.map(u => u.id_user);
            }
            if (usersToNotify.length === 0) {
                const anyAdmin = await prismaclient_1.prisma.users.findFirst({
                    where: { role: { in: ["ADMINISTRADOR", "GERENTE"] },
                        user_status: "ACTIVO"
                    },
                    select: { id_user: true }
                });
                if (anyAdmin) {
                    usersToNotify = [anyAdmin.id_user];
                }
                else {
                    let systemUser = await prismaclient_1.prisma.users.findFirst({
                        where: { email: "sistema@exemplo.com" },
                    });
                    if (!systemUser) {
                        systemUser = await prismaclient_1.prisma.users.create({
                            data: {
                                name: "Sistema",
                                email: "sistema@exemplo.com",
                                senha: (0, crypto_1.randomUUID)(),
                                born: new Date(),
                                role: "ADMINISTRADOR",
                                user_status: "ACTIVO",
                            }
                        });
                    }
                    usersToNotify = [systemUser.id_user];
                }
            }
            const notifications = await Promise.all(usersToNotify.map(userId => prismaclient_1.prisma.notification.create({
                data: {
                    user_id: userId,
                    message: `Novo cliente criado: ${client.name}`,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            })));
            console.log("🍀🍀🍀 Notificações enviadas: ", notifications.length);
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Criar Cliente",
                user,
                user_id: userId,
                details: `Cliente criado com sucesso. ` +
                    `Nome: "${client.name}" | ` +
                    `NIF: ${client.nif || 'Não informado'} | ` +
                    `Telefone: ${client.telefone || 'Não informado'} | ` +
                    `ID: ${client.id_client}` +
                    `Notificações: ${notifications.length}`,
                ip,
                resource: "clients",
                resource_id: client.id_client,
                duration,
            });
            return reply.status(201).send({
                ...client,
                notifications_sent: notifications.length
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Criar Cliente",
                user,
                user_id: userId,
                details: `Erro ao criar cliente "${name}": ${error.message}`,
                ip,
                resource: "clients",
                duration,
            });
            console.error("Erro ao criar cliente:", error);
            return reply.status(500).send({
                message: "Erro ao criar cliente",
                error: error.message
            });
        }
    });
};
exports.CreateClient = CreateClient;
