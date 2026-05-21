"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUser = void 0;
const create_1 = require("../../modules/validations/user/create");
const prismaclient_1 = require("../../lib/prismaclient");
const hashPassword_1 = require("../../modules/services/bcrypt/hashPassword");
const CreateUser = async (app) => {
    app.withTypeProvider().post('/user/create', {
        schema: {
            body: create_1.createUserSchema
        },
    }, async (req, res) => {
        const { name, email, senha, phone_number, avatar, born, role, user_status } = req.body;
        const userExists = await prismaclient_1.prisma.users.findFirst({
            where: {
                OR: [
                    { email },
                    { phone_number: phone_number || undefined }
                ]
            }
        });
        if (userExists) {
            return res.status(400).send({
                error: 'Email or Phone Number already exists',
                field: userExists.email === email ? 'email' : 'phone_number'
            });
        }
        const hashedPassword = await (0, hashPassword_1.hashPassword)(senha);
        const validRoles = ["OPERADOR", "GERENTE", "ADMINISTRADOR"];
        let userRole = "OPERADOR";
        if (role) {
            const normalizedRole = role.toUpperCase();
            if (validRoles.includes(normalizedRole)) {
                userRole = normalizedRole;
            }
            else {
                return res.status(400).send({
                    error: "Role inválida. As opções válidas são: OPERADOR, GERENTE, ADMINISTRADOR"
                });
            }
        }
        try {
            if (!born) {
                return res.status(400).send({ error: "Data de nascimento é obrigatória" });
            }
            const bornDate = new Date(born);
            if (isNaN(bornDate.getTime())) {
                return res.status(400).send({ error: "Data de nascimento inválida" });
            }
            const user = await prismaclient_1.prisma.users.create({
                data: {
                    name,
                    email,
                    senha: hashedPassword,
                    phone_number: phone_number || null,
                    avatar: avatar || null,
                    born: bornDate,
                    role: userRole,
                    user_status: "ACTIVO",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            await prismaclient_1.prisma.notification.create({
                data: {
                    user_id: user.id_user,
                    message: "Seja Bem-vindo ao sistema!",
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            });
            const { senha: _, ...userWithoutPassword } = user;
            return res.status(201).send({
                success: true,
                messge: "Usuário criado com sucesso",
                user: userWithoutPassword
            });
        }
        catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).send({
                error: "Erro interno ao criar usuário",
                details: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    });
};
exports.CreateUser = CreateUser;
