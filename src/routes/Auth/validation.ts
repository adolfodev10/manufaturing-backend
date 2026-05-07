import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { verifyToken } from "../../modules/services/jwt/verifyToken";

export const ValidationToken = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/auth/validateToken', {
        schema: {
            body: z.object({
                token: z.string(),
            })
        }
    }, async (request, reply) => {
        const { token } = request.body;

        if (!token) {
            reply.status(400).send({ error: 'Token not provided' });
            return;
        }

        const decodedToken = await verifyToken(token) as {
            id_user: string
        };

        if (!decodedToken) {
            reply.status(401).send({ error: 'Invalid token' });
            return;
        }

        const findUser = await prisma.users.findUnique({
            where: {
                id_user: decodedToken.id_user
            }
        });

        if (!findUser) {
            reply.status(400).send({ error: 'User not found' });
            return;
        }

        const userWithoutPassword = {
            id_user: findUser.id_user,
            name: findUser.name,
            email: findUser.email,
            phone_number: findUser.phone_number,
            avatar: findUser.avatar,
            born: findUser.born,
            role: findUser.role
        }

        reply.status(200).send({ message: 'Token is valid', user: userWithoutPassword });
    });
}