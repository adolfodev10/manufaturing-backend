import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const GetAllCaixa = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/caixa/getAll', {},
        async (req, res) => {
            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const caixa = await prisma.caixa.findMany({
                    select: {
                        id: true,
                        operador: true,
                        data_abertura: true,
                        data_fechadura: true,
                        operadorId: true,
                    }
                });


                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Caixa",
                    user,
                    user_id: userId,
                    details: `Listagem de caixa realizada. `,
                    ip,
                    resource: "dividas",
                    duration,
                });

                return res.status(200).send({ caixa });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Listar Caixa",
                    user,
                    user_id: userId,
                    details: `Erro ao listar caixa: ${error.message}`,
                    ip,
                    resource: "caixa",
                    duration,
                });

                console.error("Erro ao listar caixa:", error);

                return res.status(500).send({
                    error: "Erro ao listar caixa",
                    message: error.message
                });
            }
        });
};