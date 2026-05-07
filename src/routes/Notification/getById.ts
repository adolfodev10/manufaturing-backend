import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";


export const GetNotificationByUserId = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get("/notification/:userId",{
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) =>{
    const { userId } = request.params;

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: "desc"
      }
    });

    if(!notifications){
      return reply.status(404).send({
        message: "Notification not found"
      });
    }

    return reply.status(200).send(notifications);
  })
}