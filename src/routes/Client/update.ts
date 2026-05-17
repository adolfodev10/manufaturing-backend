import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { logger } from "../../modules/services/logs/logger";

export const UpdateClient = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put(
        "/client/update/:id_client",
        {
            schema: {
                params: z.object({
                    id_client: z.string().uuid(),
                }),
                body: z.object({
                    name: z.string(),
                    telefone: z.string().optional(),
                    nif: z.string().optional(),
                }),
            },
        },
        async (req, res) => {
            const startTime = Date.now();
            const { id_client } = req.params;
            const { name, telefone, nif } = req.body;
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const user = (req as any).user?.email || 'sistema';
            const userId = (req as any).user?.id;

            try {
                if (!id_client) {
                    const duration = Date.now() - startTime;
                    
                    await logger.warning({
                        action: "Atualizar Cliente",
                        user,
                        user_id: userId,
                        details: "Tentativa de atualizar cliente sem ID",
                        ip,
                        resource: "clients",
                        duration,
                    });

                    return res.status(400).send({ message: "O campo id é obrigatório" });
                }

                const existingClient = await prisma.clients.findUnique({
                    where: { id_client },
                });

                if (!existingClient) {
                    const duration = Date.now() - startTime;
                    
                    await logger.warning({
                        action: "Atualizar Cliente",
                        user,
                        user_id: userId,
                        details: `Cliente não encontrado para atualização. ID: ${id_client}`,
                        ip,
                        resource: "clients",
                        resource_id: id_client,
                        duration,
                    });

                    return res.status(404).send({ message: "Cliente não encontrado." });
                }

                // Montar lista de alterações para o log
                const alteracoes: string[] = [];
                
                if (existingClient.name !== name) {
                    alteracoes.push(`Nome: "${existingClient.name}" → "${name}"`);
                }
                
                if (nif && existingClient.nif !== nif) {
                    alteracoes.push(`NIF: "${existingClient.nif}" → "${nif}"`);
                }
                
                if (telefone && existingClient.telefone !== telefone) {
                    alteracoes.push(`Telefone: "${existingClient.telefone}" → "${telefone}"`);
                }

                // Preparar os dados a atualizar
                const updateData: { name: string; telefone?: string; nif?: string } = {
                    name,
                };

                if (typeof nif === "string" && nif.trim() !== "") {
                    updateData.nif = nif;
                }

                if (typeof telefone === "string" && telefone.trim() !== "") {
                    updateData.telefone = telefone;
                }

                const client = await prisma.clients.update({
                    where: { id_client },
                    data: updateData,
                });

                const duration = Date.now() - startTime;

                // LOG DE SUCESSO COM ALTERAÇÕES DETALHADAS
                await logger.success({
                    action: "Atualizar Cliente",
                    user,
                    user_id: userId,
                    details: `Cliente atualizado com sucesso. ` +
                             `ID: ${id_client} | ` +
                             (alteracoes.length > 0 
                                ? `Alterações: ${alteracoes.join('; ')}` 
                                : 'Nenhuma alteração detectada'),
                    ip,
                    resource: "clients",
                    resource_id: id_client,
                    duration,
                });

                return res.status(200).send(client);
                
            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Atualizar Cliente",
                    user,
                    user_id: userId,
                    details: `Erro ao atualizar cliente ID ${id_client}: ${error.message}`,
                    ip,
                    resource: "clients",
                    resource_id: id_client,
                    duration,
                });

                console.error("Erro ao atualizar cliente:", error);
                return res.status(500).send({ error: "Erro interno do servidor" });
            }
        }
    );
};