// src/routes/Logs/create.ts
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { createLog } from "./log.service";

export const CreateLog = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/logs/create", {
        schema: {
            body: z.object({
                level: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]),
                action: z.string(),
                user: z.string(),
                user_id: z.string().optional(),
                details: z.string(),
                ip: z.string().optional(),
                resource: z.string(),
                resource_id: z.string().optional(),
                old_value: z.any().optional(),
                new_value: z.any().optional(),
                duration: z.number().optional(),
            }),
        },
    },
        async (req, reply) => {
            const log = await createLog(req.body);
            return reply.status(201).send(log);
        }
    );
};