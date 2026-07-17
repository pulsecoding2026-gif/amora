const ORIGIN_POSTAL_CODE = "01001000";

async function handler(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido: envie um objeto com toPostalCode e items.");
  }

  const { toPostalCode, items } = payload;

  if (!toPostalCode || typeof toPostalCode !== "string") {
    throw new Error("CEP de destino (toPostalCode) é obrigatório e deve ser uma string.");
  }

  const cleanPostalCode = toPostalCode.replace(/\D/g, "");
  if (!/^\d{8}$/.test(cleanPostalCode)) {
    throw new Error("CEP de destino inválido. Informe 8 dígitos numéricos (ex: 01001000).");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("É necessário informar ao menos um item em 'items'.");
  }

  if (items.length > 50) {
    throw new Error("Quantidade de itens excede o limite permitido (máx. 50).");
  }

  let insuranceValue = 0;
  const products = items.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Item inválido na posição ${index}.`);
    }

    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Preço inválido no item ${index}: deve ser um número maior que zero.`);
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100) {
      throw new Error(`Quantidade inválida no item ${index}: deve ser um número entre 1 e 100.`);
    }

    insuranceValue += price * quantity;

    return {
      id: String(index),
      width: 15,
      height: 10,
      length: 20,
      weight: 0.3,
      insurance_value: price,
      quantity: quantity,
    };
  });

  if (insuranceValue <= 0) {
    throw new Error("Não foi possível calcular o valor total dos itens para o frete.");
  }

  const token = env.MELHORENVIO_TOKEN;
  if (!token) {
    throw new Error("Configuração de frete indisponível: token do Melhor Envio não configurado. Configure o secret MELHORENVIO_TOKEN nas configurações do projeto.");
  }

  const envSetting = String(env.MELHORENVIO_ENV || "").toLowerCase();
  const isProduction = envSetting === "production" || envSetting === "producao" || envSetting === "produção";

  const baseUrl = isProduction
    ? "https://www.melhorenvio.com.br"
    : "https://sandbox.melhorenvio.com.br";

  const requestBody = {
    from: {
      postal_code: ORIGIN_POSTAL_CODE,
    },
    to: {
      postal_code: cleanPostalCode,
    },
    products: products,
    options: {
      insurance_value: Number(insuranceValue.toFixed(2)),
      receipt: false,
      own_hand: false,
    },
    services: "",
  };

  let response;
  try {
    response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Aplicacao Loja Sensual (contato@loja.com)",
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    console.error("Erro de rede ao chamar Melhor Envio:", err && err.message);
    throw new Error("Não foi possível conectar ao serviço de cálculo de frete. Tente novamente em instantes.");
  }

  if (response.status === 401 || response.status === 403) {
    let details = "";
    try {
      const errJson = await response.json();
      details = errJson && (errJson.message || JSON.stringify(errJson));
    } catch (_e) {
      details = "";
    }
    console.error("Melhor Envio retornou não autorizado.", response.status, details);
    throw new Error("Falha de autenticação com o serviço de frete. Verifique se o token (MELHORENVIO_TOKEN) está correto e válido para o ambiente configurado.");
  }

  if (response.status === 422) {
    let details = "";
    try {
      const errJson = await response.json();
      details = errJson && errJson.message ? errJson.message : JSON.stringify(errJson);
    } catch (_e) {
      details = "dados inválidos enviados ao serviço de frete.";
    }
    console.error("Melhor Envio retornou erro de validação:", details);
    throw new Error("Não foi possível calcular o frete para o CEP informado. Verifique o endereço de destino.");
  }

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch (_e) {
      bodyText = "";
    }
    console.error("Erro inesperado do Melhor Envio:", response.status, bodyText);
    throw new Error("Serviço de cálculo de frete indisponível no momento. Tente novamente mais tarde.");
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error("Resposta inválida do Melhor Envio:", err && err.message);
    throw new Error("Resposta inválida do serviço de frete.");
  }

  if (!Array.isArray(data)) {
    console.error("Formato inesperado de resposta do Melhor Envio:", data);
    throw new Error("Resposta inesperada do serviço de frete.");
  }

  const options = data
    .filter((entry) => entry && !entry.error && entry.price)
    .map((entry) => {
      const companyName = entry.company && entry.company.name ? entry.company.name : "Transportadora";
      const serviceName = entry.name ? entry.name : "Serviço";
      const priceNumber = Number(entry.price);
      const deliveryDays = entry.delivery_time !== undefined && entry.delivery_time !== null
        ? Number(entry.delivery_time)
        : null;

      return {
        id: entry.id !== undefined ? String(entry.id) : `${companyName}-${serviceName}`,
        name: `${companyName} - ${serviceName}`,
        price: Number.isFinite(priceNumber) ? Number(priceNumber.toFixed(2)) : null,
        deliveryTime: Number.isFinite(deliveryDays) ? deliveryDays : null,
        company: companyName,
      };
    })
    .filter((option) => option.price !== null && option.price > 0);

  if (options.length === 0) {
    throw new Error("Nenhuma opção de frete disponível para o CEP informado.");
  }

  options.sort((a, b) => a.price - b.price);

  return { options };
}