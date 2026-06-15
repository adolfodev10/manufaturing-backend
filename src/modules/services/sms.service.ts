// backend/modules/services/sms/sms.service.ts
import axios from 'axios';

interface SmsWelcomeData {
  telefone: string;
  name: string;
  password: string;
  email?: string;
}

export const enviarSMSBoasVindas = async (data: SmsWelcomeData): Promise<{ success: boolean; error?: string }> => {
  const { telefone, name, password, email } = data;

  // Limpar número (apenas dígitos)
  let numeroLimpo = telefone.replace(/\D/g, '');

  // Remover código do país se tiver (Angola = 244)
  if (numeroLimpo.startsWith('244')) {
    numeroLimpo = numeroLimpo.substring(3);
  }

  // Garantir que o número tem 9 dígitos (Angola)
  if (numeroLimpo.length !== 9) {
    console.error(`❌ Número inválido: ${numeroLimpo} (deve ter 9 dígitos)`);
    return { success: false, error: 'Número de telefone inválido' };
  }

  // Gerar mensagem de boas-vindas
  const mensagem = gerarMensagemBoasVindas({
    name,
    email: email || 'não informado',
    password
  });

  console.log(`📱 Enviando SMS para: ${numeroLimpo}`);
  console.log(`📝 Mensagem: ${mensagem.substring(0, 100)}...`);
  console.log(`🔑 API Key: ${process.env.SMS_API_KEY?.substring(0, 10)}...`);

  try {
    const url = `https://www.telcosms.co.ao/api/v2/send_message`;
    const params = new URLSearchParams();
    params.append('api_key_app', process.env.SMS_API_KEY || '');
    params.append('phone_number', numeroLimpo);
    params.append('message_body', mensagem);
    params.append('sender', 'EKO SISTEMA');

    const response = await axios.get(url, {
      params,
      headers: {
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    console.log('📦 Resposta TelcoSMS:', response.data);

    if (response.data && response.data.status === 200) {
      console.log('✅ SMS enviado com sucesso!');
      return { success: true };
    } else {
      console.log('❌ Falha no envio:', response.data);
      return { success: false, error: response.data?.message || 'Erro desconhecido' };
    }

  } catch (error: any) {
    console.error('❌ Erro ao enviar SMS:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// ============================================
// MENSAGENS PARA O EKO
// ============================================

export const gerarMensagemBoasVindas = (data: { name: string; email: string; password: string }): string => {
  const loginUrl = process.env.FRONTEND_URL || 'https://eko-manufaturing.vercel.app';
  
  return `Bem-vindo ao EKO, ${data.name}! 🎉 Sua conta foi criada com sucesso. Email: ${data.email} | Senha: ${data.password}. Acesse: ${loginUrl}/auth/login. Recomendamos alterar sua senha após o primeiro acesso. - EKO Sistema`;
};

export const gerarMensagemProdutoVencido = (produto: any): string => {
  return `⚠️ ALERTA EKO: O produto "${produto.name_product}" com lote ${produto.id_product} vence em ${new Date(produto.date_validate).toLocaleDateString('pt-AO')}. Verifique seu estoque! - EKO Sistema`;
};

export const gerarMensagemDividaPendente = (cliente: any, divida: any): string => {
  const valorFormatado = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(Number(divida.price));

  return `📢 EKO: Cliente ${cliente.name} possui dívida de ${valorFormatado} vencida em ${new Date(divida.date).toLocaleDateString('pt-AO')}. Regularize! - EKO Sistema`;
};

export const gerarMensagemVendaRealizada = (venda: any): string => {
  const valorFormatado = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(Number(venda.price));

  return `💰 VENDA REGISTRADA EKO: Produto: ${venda.name_product} | Valor: ${valorFormatado} | Qtd: ${venda.quantity} - EKO Sistema`;
};

export const gerarMensagemEstoqueBaixo = (produto: any): string => {
  return `⚠️ EKO: Estoque baixo do produto "${produto.name_product}". Quantidade atual: ${produto.quantity} unidades. Reponha! - EKO Sistema`;
};

export const gerarMensagemUsuarioCriado = (data: { name: string; email: string; telefone: string; password: string }): string => {
  const loginUrl = process.env.FRONTEND_URL || 'https://eko-manufaturing.vercel.app';
  
  return `🔐 EKO - Usuário criado: ${data.name}. Email: ${data.email} | Senha: ${data.password}. Acesse: ${loginUrl}/auth/login - EKO Sistema`;
};