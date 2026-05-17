import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

// Valores por defeito – podem ser movidos para um ficheiro separado
const defaultConfigs = {
  geral: {
    nome_empresa: "Minha Empresa Ltda",
    nif: "123456789",
    endereco: "Av. Principal, 123",
    cidade: "Luanda",
    pais: "Angola",
    telefone: "+244 123 456 789",
    email: "contato@minhaempresa.com",
    website: "www.minhaempresa.com",
    timezone: "Africa/Luanda",
    data_formato: "DD/MM/YYYY",
    moeda: "AOA",
    idioma: "pt-AO",
  },
  fiscal: {
    regime: "normal",
    tax_rate: 14,
    invoice_prefix: "FAT",
    invoice_series: "A",
    invoice_next_number: 1001,
    receipt_prefix: "REC",
    receipt_series: "A",
    receipt_next_number: 1001,
    vat_number: "5412345678",
    company_type: "limitada",
    economic_activity: "comercio",
    certificate_number: "CERT-2024-001",
    software_certificate: "SOFT-2024-001",
    rsa_private_key: "",
    rsa_public_key: "",
    hash_chain_enabled: true,
    hash_algorithm: "SHA-256",
    agt_webservice_url: "https://sifphml.minfin.gov.ao/sigt/fe/v1/",
    agt_api_key: "",
    agt_sync_enabled: true,
    invoice_immutability: true,
    invoice_footer_text: "Documento emitido por [NOME_SOFTWARE] - Nº Certificado: [CERTIFICADO] - NIF: [NIF]",
    tax_rates: [
      { id: "1", name: "IVA Normal", rate: 14, is_default: true },
      { id: "2", name: "IVA Isento", rate: 0, is_default: false },
      { id: "3", name: "IVA Simplificado", rate: 7, is_default: false },
    ],
  },
  notificacao: {
    email_enabled: true,
    email_smtp_host: "smtp.gmail.com",
    email_smtp_port: 587,
    email_smtp_secure: true,
    email_smtp_user: "contato@minhaempresa.com",
    email_smtp_pass: "",
    email_from: "naoresponder@minhaempresa.com",
    email_from_name: "Sistema Gestão",
    sms_enabled: false,
    sms_provider: "twilio",
    sms_api_key: "",
    sms_api_secret: "",
    sms_sender: "",
    push_enabled: false,
    push_public_key: "",
    push_private_key: "",
    notify_on_user_register: true,
    notify_on_sale: true,
    notify_on_payment: true,
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
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: true,
    password_expiry_days: 90,
    api_rate_limit: 60,
    ip_whitelist: ["127.0.0.1", "192.168.1.0/24"],
    maintenance_mode: false,
  },
  backup: {
    auto_backup: true,
    backup_frequency: "daily",
    backup_time: "02:00",
    backup_retention_days: 30,
    backup_tables: ["users", "clients", "invoices", "products", "sales"],
    backup_compression: true,
    backup_encryption: false,
    backup_location: "/backups",
    backup_cloud_enabled: false,
    backup_notify_on_failure: true,
  },
  personalizacao: {
    theme: "system",
    primary_color: "#3b82f6",
    secondary_color: "#6b7280",
    accent_color: "#8b5cf6",
    font_family: "Inter",
    font_size: "medium",
    sidebar_collapsed: false,
    dense_mode: false,
    animations_enabled: true,
  },
  sistema: {
    sistema_nome: "Sistema de Gestão",
    sistema_versao: "1.0.0",
    sistema_ambiente: "production",
    debug_mode: false,
    log_level: "info",
    log_retention_days: 30,
    allow_registrations: true,
    require_email_verification: true,
    default_user_role: "OPERADOR",
    session_driver: "database",
    cache_driver: "file",
    queue_driver: "database",
  },
};

export const ConfiguracoesRoutes = async (app: FastifyInstance) => {
  // GET – obter todas as configurações
  app.withTypeProvider<ZodTypeProvider>().get("/configuracoes", {},
    async (req, reply) => {
      try {
        // Buscar todas as linhas da tabela system_config
        const configs = await prisma.system_config.findMany();
        // Converter para objecto { key: value }
        const result: Record<string, any> = {};
        configs.forEach((c) => {
          result[c.key] = c.value;
        });

        // Se não existir nenhuma configuração, retornar os defaults
        if (Object.keys(result).length === 0) {
          return reply.status(200).send(defaultConfigs);
        }

        // Juntar com os defaults para garantir que campos novos apareçam
        const merged = { ...defaultConfigs, ...result };
        return reply.status(200).send(merged);
      } catch (error: any) {
        console.error("Erro ao buscar configurações:", error);
        return reply.status(500).send({ error: "Erro interno" });
      }
    }
  );

  // PUT – actualizar configurações (enviar objecto com as secções a actualizar)
  app.withTypeProvider<ZodTypeProvider>().put("/configuracoes", {
    schema: {
      body: z.record(z.string(), z.any()), // aceita qualquer objecto com chaves string
    },
  }, async (req, reply) => {
    const updates = req.body as Record<string, any>;
    const user = (req as any).user?.email || "sistema";
    const userId = (req as any).user?.id;

    try {
      // Para cada chave recebida, fazer upsert
      for (const key of Object.keys(updates)) {
        await prisma.system_config.upsert({
          where: { key },
          update: { value: updates[key] },
          create: { key, value: updates[key] },
        });
      }

      // Log da operação
      try {
        await prisma.logs.create({
          data: {
            level: "INFO",
            action: "Actualizar Configurações",
            user,
            user_id: userId,
            details: `Configurações actualizadas: ${Object.keys(updates).join(", ")}`,
            ip: req.ip,
            resource: "configuracoes",
          },
        });
      } catch (logErr) {
        console.error("Erro ao criar log:", logErr);
      }

      return reply.status(200).send({ success: true });
    } catch (error: any) {
      console.error("Erro ao actualizar configurações:", error);
      return reply.status(500).send({ error: "Erro ao guardar configurações" });
    }
  });
};