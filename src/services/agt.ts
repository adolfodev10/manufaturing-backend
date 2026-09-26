const AGT_CONFIG = {
  baseURL:
    process.env.AGT_BASE_URL || "https://sifphml.minfin.gov.ao",
  endpoint: "/sigt/fe/v1/registarFactura",
  username: process.env.AGT_USERNAME || "",
  password: process.env.AGT_SENHA || "",
  timeoutMs: 20000,
};

export interface AgtItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  taxaIVA: number;
  total: number;
}

export interface AgtDocumento {
  nifEmitente: string;
  nifAdquirente: string;
  numeroDocumento: string;
  dataEmissao: string;
  tipoDocumento: "FT" | "NC" | "ND";
  itens: AgtItem[];
  totais: {
    baseTributavel: number;
    iva: number;
    total: number;
  };
  hashSoftware: string;
  qrCodeData: string;
}

export interface AgtResponse {
  success: boolean;
  message: string;
  codigoValidacao?: string;
  hashFiscal?: string;
  dataProcessamento?: string;
}

/**
 * Envia um documento à AGT.
 * Corre no backend — credenciais nunca saem do servidor.
 */
export async function enviarDocumentoAGT(
  documento: AgtDocumento,
): Promise<AgtResponse> {
  if (!AGT_CONFIG.username || !AGT_CONFIG.password) {
    return {
      success: false,
      message:
        "Credenciais AGT não configuradas. Verifique AGT_USERNAME e AGT_SENHA no .env",
    };
  }

  const url = `${AGT_CONFIG.baseURL}${AGT_CONFIG.endpoint}`;
  const auth = Buffer.from(
    `${AGT_CONFIG.username}:${AGT_CONFIG.password}`,
  ).toString("base64");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(documento),
      signal: AbortSignal.timeout(AGT_CONFIG.timeoutMs),
    });
  } catch (err: any) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      return {
        success: false,
        message: `Timeout ao contactar AGT (${AGT_CONFIG.timeoutMs}ms)`,
      };
    }
    return {
      success: false,
      message: `Erro de conexão com AGT: ${err?.message || "desconhecido"}`,
    };
  }

  const texto = await res.text();

  if (!res.ok) {
    return {
      success: false,
      message: `AGT respondeu HTTP ${res.status}: ${texto.slice(0, 200)}`,
    };
  }

  let data: any;
  try {
    data = JSON.parse(texto);
  } catch {
    return {
      success: false,
      message: `AGT devolveu resposta inválida (não é JSON): ${texto.slice(0, 200)}`,
    };
  }

  // Normalizar resposta
  return {
    success: !!(data.success && data.hashFiscal),
    message: data.message || (data.success ? "OK" : "Resposta sem sucesso"),
    hashFiscal: data.hashFiscal,
    codigoValidacao: data.codigoValidacao,
    dataProcessamento: data.dataProcessamento,
  };
}