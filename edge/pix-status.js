async function handler(payload) {
  if (!payload || typeof payload.paymentId !== 'string' || !payload.paymentId.trim()) {
    throw new Error('paymentId é obrigatório');
  }

  const apiKey = env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY não configurado');
  }

  const isSandbox = apiKey.startsWith('$aact_hmlg');
  const baseUrl = isSandbox
    ? 'https://api-sandbox.asaas.com/v3'
    : 'https://api.asaas.com/v3';

  const headers = {
    'access_token': apiKey,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${baseUrl}/payments/${payload.paymentId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao consultar pagamento: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const status = data.status;
  const paid = status === 'RECEIVED' || status === 'CONFIRMED';

  return { status, paid };
}