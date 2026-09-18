import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  abrirCaixa,
  fecharCaixa,
  getCaixaAberto,
  calcularResumoCaixa,
  listarCaixas,
} from "./caixa.service";
import { createCaixaSchema, fecharCaixaSchema, listarCaixaQuerySchema } from "../../modules/validations/caixa/caixa.schema";

export const caixaRoutes = async (app: FastifyInstance) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // ---------- ABRIR ----------
  server.post(
    "/caixa/abrir",
    { schema: { body: createCaixaSchema } },
    async (req, reply) => {
      try {
        const caixa = await abrirCaixa(req.body);
        return reply.status(201).send({ success: true, data: caixa });
      } catch (err: any) {
        return reply.status(400).send({ success: false, error: err.message });
      }
    }
  );

  // ---------- CAIXA ABERTO DO OPERADOR ----------
  server.get(
    "/caixa/aberto/:operadorId",
    {
      schema: { params: z.object({ operadorId: z.string().uuid() }) },
    },
    async (req, reply) => {
      const caixa = await getCaixaAberto(req.params.operadorId);
      return reply.status(200).send({ success: true, data: caixa }); // null se não houver
    }
  );

  // ---------- RESUMO ----------
  server.get(
    "/caixa/:id/resumo",
    { schema: { params: z.object({ id: z.string().uuid() }) } },
    async (req, reply) => {
      try {
        const resumo = await calcularResumoCaixa(req.params.id);
        return reply.status(200).send({ success: true, data: resumo });
      } catch (err: any) {
        return reply.status(404).send({ success: false, error: err.message });
      }
    }
  );

  // ---------- FECHAR ----------
  server.patch(
    "/caixa/fechar",
    { schema: { body: fecharCaixaSchema } },
    async (req, reply) => {
      try {
        const caixa = await fecharCaixa(req.body);
        return reply.status(200).send({ success: true, data: caixa });
      } catch (err: any) {
        return reply.status(400).send({ success: false, error: err.message });
      }
    }
  );

  // ---------- LISTAR ----------
  server.get(
    "/caixa/getAll",
    { schema: { querystring: listarCaixaQuerySchema } },
    async (req, reply) => {
      const caixas = await listarCaixas(req.query);
      return reply.status(200).send({ success: true, data: caixas });
    }
  );
};