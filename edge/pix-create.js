async function handler(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload inválido: esperado objeto com customer, amount e description');
  }

  const { customer, amount, description } = payload;

  if (!customer || typeof customer !== 'object') {
    throw new Error('Campo "customer" é obrigatório e deve ser um objeto');
  }
  const { name, cpf, email, phone } = customer;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('customer.name é obrigatório');
  }
  if (!cpf || typeof cpf !== 'string') {
    throw new Error('customer.cpf é obrigatório');
  }
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) {
    throw new Error('CPF deve conter 11 dígitos numéricos');
  }
  if (email && typeof email !== 'string') {
    throw new Error('customer.email deve ser string');
  }
  if (phone && typeof phone !== 'string') {
    throw new Error('customer.phone deve ser string');
  }

  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('amount deve ser um número maior que zero');
  }
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    throw new Error('description é obrigatória');
  }

  const apiKey = env.ASAAS_API_KEY;
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('Secret ASAAS_API_KEY não configurado no ambiente');
  }

  const isSandbox = apiKey.startsWith('$aact_hmlg');
  const baseUrl = isSandbox
    ? 'https://api-sandbox.asaas.com/v3'
    : 'https://api.asaas.com/v3';

  const headers = {
    'access_token': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  async function asaasFetch(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) }
    });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      const msg = data.errors?.[0]?.description || data.message || `HTTP ${res.status}`;
      throw new Error(`ASAAS ${res.status}: ${msg}`);
    }
    return data;
  }

  let customerId;

  const searchRes = await asaasFetch(`/customers?cpfCnpj=${cleanCpf}`);
  if (searchRes.data && searchRes.data.length > 0) {
    customerId = searchRes.data[0].id;
  } else {
    const createCustomerRes = await asaasFetch('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        cpfCnpj: cleanCpf,
        email: email?.trim() || undefined,
        phone: phone?.trim() || undefined
      })
    });
    customerId = createCustomerRes.id;
  }

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 1);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const paymentRes = await asaasFetch('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'PIX',
      value: amount,
      dueDate: dueDateStr,
      description: description.trim()
    })
  });

  const paymentId = paymentRes.id;

  const qrRes = await asaasFetch(`/payments/${paymentId}/pixQrCode`);

  return {
    paymentId,
    qrCode: qrRes.payload,
    qrCodeBase64: qrRes.encodedImage
  };
}