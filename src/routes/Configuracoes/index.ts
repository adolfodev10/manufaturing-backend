import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";

/* ============================================================
   Configurações padrão (fallback quando a BD está vazia)
   ============================================================ */
const DEFAULT_CONFIGS: Record<string, any> = {
  geral: {
    nome_empresa: "EKO - COMÉRCIO GERAL (SU), LDA",
    nif: "5003862524",
    endereco: "Rua Bairro Tala Hady, Nº A",
    cidade: "Luanda",
    pais: "Angola",
    telefone: "+244 923 456 789",
    email: "eko.comercial@eko.ao",
    website: "",
    logo_url: "",
    timezone: "Africa/Luanda",
    data_formato: "DD/MM/YYYY",
    moeda: "AOA",
    idioma: "pt-AO",
  },
  fiscal: {
    regime: "normal",
    tax_rate: 14,
    invoice_prefix: "FR",
    invoice_series: "A",
    invoice_next_number: 1,
    receipt_prefix: "RC",
    receipt_series: "A",
    receipt_next_number: 1,
    vat_number: "5003862524",
    company_type: "limitada",
    economic_activity: "",
    certificate_number: "",
    software_certificate: "",
    rsa_private_key: "",
    rsa_public_key: "",
    hash_chain_enabled: true,
    hash_algorithm: "SHA-256",
    agt_webservice_url: "https://sifphml.minfin.gov.ao/sigt/fe/v1/",
    agt_api_key: "",
    agt_sync_enabled: false,
    invoice_immutability: true,
    invoice_footer_text:
      "Processado por EKO v1.0 — Certificado nº [CERTIFICADO] — NIF [NIF]",
    tax_rates: [
      { id: "1", name: "IVA Normal", rate: 14, is_default: true },
      { id: "2", name: "IVA Reduzido", rate: 7, is_default: false },
      { id: "3", name: "Isento", rate: 0, is_default: false },
    ],
  },
  notificacao: {
    email_enabled: false,
    email_smtp_host: "smtp.gmail.com",
    email_smtp_port: 587,
    email_smtp_secure: false,
    email_smtp_user: "",
    email_smtp_pass: "",
    email_from: "",
    email_from_name: "EKO",
    sms_enabled: false,
    sms_provider: "",
    sms_api_key: "",
    sms_api_secret: "",
    sms_sender: "",
    push_enabled: false,
    push_public_key: "",
    push_private_key: "",
    notify_on_user_register: false,
    notify_on_sale: false,
    notify_on_payment: false,
    notify_on_low_stock: true,
    notify_on_backup: true,
    notify_on_error: true,
  },
  seguranca: {
    two_factor_auth: false,
    session_timeout: 30,
    max_login_attempts: 5,
    lockout_duration: 15,
    password_min_length: 8,
    password_require_uppercase: false,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: false,
    password_expiry_days: 90,
    api_rate_limit: 60,
    ip_whitelist: [],
    maintenance_mode: false,
  },
  backup: {
    auto_backup: false,
    backup_frequency: "daily",
    backup_time: "02:00",
    backup_retention_days: 30,
    backup_tables: [],
    backup_compression: true,
    backup_encryption: false,
    backup_location: "",
    backup_cloud_enabled: false,
    backup_cloud_provider: "",
    backup_cloud_bucket: "",
    backup_notify_on_failure: true,
  },
  personalizacao: {
    theme: "system",
    primary_color: "#3b82f6",
    secondary_color: "#8b5cf6",
    accent_color: "#06b6d4",
    font_family: "Inter",
    font_size: "medium",
    sidebar_collapsed: false,
    dense_mode: false,
    animations_enabled: true,
    custom_css: "",
    logo_dark_url: "",
    logo_light_url: "",
    favicon_url: "",
  },
  sistema: {
    sistema_nome: "EKO",
    sistema_versao: "1.0.0",
    sistema_ambiente: "production",
    debug_mode: false,
    log_level: "info",
    log_retention_days: 30,
    maintenance_message: "",
    allow_registrations: false,
    require_email_verification: true,
    default_user_role: "OPERADOR",
    session_driver: "database",
    cache_driver: "database",
    queue_driver: "database",
  },
};

const CATEGORIAS = [
  "geral",
  "fiscal",
  "notificacao",
  "seguranca",
  "backup",
  "personalizacao",
  "sistema",
] as const;

/* ============================================================
   Rotas
   ============================================================ */
export const ConfiguracoesRoutes = async (app: FastifyInstance) => {
  /* GET /configuracoes — devolve todas as categorias */
  app.withTypeProvider<ZodTypeProvider>().get(
    "/configuracoes",
    async (_request, reply) => {
      try {
        const registos = await prisma.configuracoes.findMany();

        const resultado: Record<string, any> = {};

        for (const cat of CATEGORIAS) {
          const existente = registos.find((r) => r.chave === cat);
          resultado[cat] = existente ? existente.valor : DEFAULT_CONFIGS[cat];
        }

        return reply.send(resultado);
      } catch (error) {
        console.error("[configuracoes] GET error:", error);
        return reply.status(500).send({
          success: false,
          message: "Erro ao carregar configurações",
        });
      }
    }
  );

  /* PUT /configuracoes — salva tudo */
  app.withTypeProvider<ZodTypeProvider>().put(
    "/configuracoes",
    {
      schema: {
        body: z.record(z.any()),
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as Record<string, any>;
        const userId = (request as any).user?.id_user || null;

        const operacoes: any[] = [];

        for (const cat of CATEGORIAS) {
          const valor = body[cat];
          if (!valor) continue;

          operacoes.push(
            prisma.configuracoes.upsert({
              where: { chave: cat },
              update: {
                valor,
                atualizado_por: userId,
              },
              create: {
                chave: cat,
                valor,
                categoria: cat,
                descricao: `Configurações de ${cat}`,
                atualizado_por: userId,
              },
            })
          );
        }

        if (operacoes.length === 0) {
          return reply.status(400).send({
            success: false,
            message: "Nenhuma configuração válida enviada",
          });
        }

        await prisma.$transaction(operacoes);

        return reply.send({
          success: true,
          message: "Configurações salvas com sucesso",
        });
      } catch (error) {
        console.error("[configuracoes] PUT error:", error);
        return reply.status(500).send({
          success: false,
          message: "Erro ao salvar configurações",
        });
      }
    }
  );

  /* GET /configuracoes/:categoria */
  app.withTypeProvider<ZodTypeProvider>().get(
    "/configuracoes/:categoria",
    {
      schema: {
        params: z.object({
          categoria: z.enum(CATEGORIAS),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { categoria } = request.params;
        const registo = await prisma.configuracoes.findUnique({
          where: { chave: categoria },
        });

        return reply.send({
          success: true,
          data: registo ? registo.valor : DEFAULT_CONFIGS[categoria],
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          message: "Erro ao carregar categoria",
        });
      }
    }
  );

  /* PUT /configuracoes/:categoria */
  app.withTypeProvider<ZodTypeProvider>().put(
    "/configuracoes/:categoria",
    {
      schema: {
        params: z.object({
          categoria: z.enum(CATEGORIAS),
        }),
        body: z.record(z.any()),
      },
    },
    async (request, reply) => {
      try {
        const { categoria } = request.params;
        const userId = (request as any).user?.id_user || null;

        const registo = await prisma.configuracoes.upsert({
          where: { chave: categoria },
          update: {
            valor: request.body,
            atualizado_por: userId,
          },
          create: {
            chave: categoria,
            valor: request.body,
            categoria,
            atualizado_por: userId,
          },
        });

        return reply.send({ success: true, data: registo });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          message: "Erro ao salvar categoria",
        });
      }
    }
  );

  /* POST /configuracoes/reset */
  app.withTypeProvider<ZodTypeProvider>().post(
    "/configuracoes/reset",
    async (request, reply) => {
      try {
        const userId = (request as any).user?.id_user || null;

        await prisma.$transaction(
          CATEGORIAS.map((cat) =>
            prisma.configuracoes.upsert({
              where: { chave: cat },
              update: {
                valor: DEFAULT_CONFIGS[cat],
                atualizado_por: userId,
              },
              create: {
                chave: cat,
                valor: DEFAULT_CONFIGS[cat],
                categoria: cat,
                atualizado_por: userId,
              },
            })
          )
        );

        return reply.send({
          success: true,
          message: "Configurações restauradas com sucesso",
        });
      } catch (error) {
        console.error("[configuracoes] RESET error:", error);
        return reply.status(500).send({
          success: false,
          message: "Erro ao restaurar configurações",
        });
      }
    }
  );
};