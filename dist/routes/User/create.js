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
        const { name, email, senha, phone_number, avatar, born, funcao_id } = req.body;
        const userExists = await prismaclient_1.prisma.users.findFirst({
            where: {
                OR: [
                    {
                        email,
                    },
                    {
                        phone_number,
                    }
                ]
            }
        });
        if (userExists) {
            return res.status(400).send({ error: 'Email or Phone Number already exists' });
        }
        const funcao = await prismaclient_1.prisma.funcao.findUnique({
            where: {
                id_funcao: funcao_id,
            },
        });
        if (!funcao) {
            return res.status(404).send({ error: 'Funcao not found' });
        }
        const hashedPassword = await (0, hashPassword_1.hashPassword)(senha);
        const user = await prismaclient_1.prisma.users.create({
            data: {
                name,
                email,
                senha: hashedPassword,
                phone_number,
                avatar,
                born,
                funcao_id,
                user_status: 'ACTIVO',
            },
        });
        return res.status(201).send(user);
    });
};
exports.CreateUser = CreateUser;
