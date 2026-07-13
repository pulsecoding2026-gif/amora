import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  userId: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  status: "pending" | "completed";
  timestamp: number;
}

interface FormErrors {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao">("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    }
  }, [user, navigate]);

  const validateField = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (field === "address") {
        next.address = address.trim().length < 5 ? "Informe um endereço válido (rua e número)." : undefined;
      }
      if (field === "city") {
        next.city = city.trim().length < 2 ? "Informe a cidade." : undefined;
      }
      if (field === "state") {
        next.state = state.trim().length !== 2 ? "Use a sigla do estado (ex.: SP)." : undefined;
      }
      if (field === "zip") {
        next.zip = !/^\d{5}-?\d{3}$/.test(zip) ? "CEP inválido. Use o formato 00000-000." : undefined;
      }
      if (paymentMethod === "cartao") {
        if (field === "cardNumber") {
          next.cardNumber = cardNumber.replace(/\s/g, "").length < 13 ? "Número de cartão inválido." : undefined;
        }
        if (field === "cardName") {
          next.cardName = cardName.trim().length < 3 ? "Informe o nome impresso no cartão." : undefined;
        }
        if (field === "cardExpiry") {
          next.cardExpiry = !/^\d{2}\/\d{2}$/.test(cardExpiry) ? "Use o formato MM/AA." : undefined;
        }
        if (field === "cardCvv") {
          next.cardCvv = !/^\d{3,4}$/.test(cardCvv) ? "CVV inválido." : undefined;
        }
      }
      return next;
    });
  };

  const validateAll = (): boolean => {
    const next: FormErrors = {};
    if (address.trim().length < 5) next.address = "Informe um endereço válido (rua e número).";
    if (city.trim().length < 2) next.city = "Informe a cidade.";
    if (state.trim().length !== 2) next.state = "Use a sigla do estado (ex.: SP).";
    if (!/^\d{5}-?\d{3}$/.test(zip)) next.zip = "CEP inválido. Use o formato 00000-000.";
    if (paymentMethod === "cartao") {
      if (cardNumber.replace(/\s/g, "").length < 13) next.cardNumber = "Número de cartão inválido.";
      if (cardName.trim().length < 3) next.cardName = "Informe o nome impresso no cartão.";
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) next.cardExpiry = "Use o formato MM/AA.";
      if (!/^\d{3,4}$/.test(cardCvv)) next.cardCvv = "CVV inválido.";
    }
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) return;

    if (!validateAll()) return;

    setSubmitting(true);

    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
      shippingAddress: `${address}, ${city} - ${state.toUpperCase()}, ${zip}`,
      paymentMethod: paymentMethod === "pix" ? "Pix" : `Cartão terminado em ${cardNumber.replace(/\s/g, "").slice(-4)}`,
      status: "pending",
      timestamp: Date.now(),
    };

    window.setTimeout(() => {
      const existingOrders = JSON.parse(localStorage.getItem("amora_orders") || "[]") as Order[];
      localStorage.setItem("amora_orders", JSON.stringify([...existingOrders, newOrder]));

      clearCart();
      setPlacedOrder(newOrder);
      setOrderPlaced(true);
      setSubmitting(false);
    }, 600);
  };

  if (!user) {
    return null;
  }

  if (orderPlaced && placedOrder) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100">
        <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl shadow-xl p-8">
          <CardHeader className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500/15">
              <ShoppingBag className="h-8 w-8 text-fuchsia-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-zinc-50 mb-2 [text-wrap:balance]">Pedido confirmado!</CardTitle>
            <p className="text-zinc-400">Obrigado(a) pela sua compra, {user.name}.</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 mb-6 text-left">
              <p className="text-sm text-zinc-400">Número do pedido</p>
              <p className="font-mono text-lg text-zinc-100 mb-3">{placedOrder.id}</p>
              <p className="text-sm text-zinc-400">Total pago</p>
              <p className="text-lg font-semibold text-fuchsia-400 tabular-nums">
                R$ {placedOrder.total.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              Você receberá atualizações do envio por e-mail. A entrega é discreta, sem identificação do conteúdo na embalagem.
            </p>
            <Button onClick={() => navigate("/")} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold h-11 rounded-lg transition-colors active:scale-[0.98]">
              Continuar comprando
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-dvh pt-24 pb-12 bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
            <ShoppingBag className="h-8 w-8 text-zinc-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 mb-2">Seu carrinho está vazio</h1>
          <p className="text-zinc-400 mb-6">Adicione produtos ao carrinho antes de finalizar a compra.</p>
          <Link to="/">
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold h-11 px-6 rounded-lg transition-colors active:scale-[0.98]">
              Explorar produtos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pt-24 pb-12 bg-zinc-950 text-zinc-100 antialiased">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-50 leading-[1.1] mb-10 [text-wrap:balance]">
          Finalizar compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl shadow-xl p-6">
            <CardHeader className="mb-6 p-0">
              <CardTitle className="text-xl font-bold text-zinc-50">Endereço de entrega</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-zinc-300 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    maxLength={120}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => validateField("address")}
                    className={cn(
                      "w-full px-4 py-2 border rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors",
                      errors.address ? "border-red-500" : "border-zinc-700"
                    )}
                    placeholder="Rua das Orquídeas, 123, apto 45"
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-zinc-300 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      maxLength={80}
                      onChange={(e) => setCity(e.target.value)}
                      onBlur={() => validateField("city")}
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors",
                        errors.city ? "border-red-500" : "border-zinc-700"
                      )}
                      placeholder="São Paulo"
                    />
                    {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-zinc-300 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      onBlur={() => validateField("state")}
                      maxLength={2}
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors uppercase",
                        errors.state ? "border-red-500" : "border-zinc-700"
                      )}
                      placeholder="SP"
                    />
                    {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-zinc-300 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    onBlur={() => validateField("zip")}
                    inputMode="numeric"
                    maxLength={9}
                    className={cn(
                      "w-full px-4 py-2 border rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors",
                      errors.zip ? "border-red-500" : "border-zinc-700"
                    )}
                    placeholder="01234-567"
                  />
                  {errors.zip && <p className="text-sm text-red-500 mt-1">{errors.zip}</p>}
                </div>

                <h3 className="text-lg font-semibold text-zinc-50 mt-6 mb-3">Pagamento</h3>
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={cn(
                      "flex-1 h-11 rounded-lg border text-sm font-medium transition-colors",
                      paymentMethod === "pix"
                        ? "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300"
                        : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                    )}
                  >
                    Pix
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cartao")}
                    className={cn(
                      "flex-1 h-11 rounded-lg border text-sm font-medium transition-colors",
                      paymentMethod === "cartao"
                        ? "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300"
                        : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                    )}
                  >
                    Cartão de crédito
                  </button>
                </div>

                {paymentMethod === "pix" ? (
                  <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/60">
                    <p className="text-zinc-200 font-medium text-sm">Pagamento via Pix</p>
                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                      O código Pix será gerado após a confirmação do pedido, com validade de 30 minutos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 border border-zinc-700 rounded-lg p-4 bg-zinc-800/60">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-zinc-300 mb-1">
                        Número do cartão
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        inputMode="numeric"
                        maxLength={19}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim())}
                        onBlur={() => validateField("cardNumber")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors tabular-nums",
                          errors.cardNumber ? "border-red-500" : "border-zinc-700"
                        )}
                        placeholder="0000 0000 0000 0000"
                      />
                      {errors.cardNumber && <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-zinc-300 mb-1">
                        Nome impresso no cartão
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        value={cardName}
                        maxLength={80}
                        onChange={(e) => setCardName(e.target.value)}
                        onBlur={() => validateField("cardName")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors",
                          errors.cardName ? "border-red-500" : "border-zinc-700"
                        )}
                        placeholder="Como está no cartão"
                      />
                      {errors.cardName && <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-zinc-300 mb-1">
                          Validade
                        </label>
                        <input
                          type="text"
                          id="cardExpiry"
                          value={cardExpiry}
                          maxLength={5}
                          onChange={(e) => {
                            let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                            if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                            setCardExpiry(v);
                          }}
                          onBlur={() => validateField("cardExpiry")}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors tabular-nums",
                            errors.cardExpiry ? "border-red-500" : "border-zinc-700"
                          )}
                          placeholder="MM/AA"
                        />
                        {errors.cardExpiry && <p className="text-sm text-red-500 mt-1">{errors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label htmlFor="cardCvv" className="block text-sm font-medium text-zinc-300 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cardCvv"
                          value={cardCvv}
                          inputMode="numeric"
                          maxLength={4}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^\d]/g, ""))}
                          onBlur={() => validateField("cardCvv")}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors tabular-nums",
                            errors.cardCvv ? "border-red-500" : "border-zinc-700"
                          )}
                          placeholder="000"
                        />
                        {errors.cardCvv && <p className="text-sm text-red-500 mt-1">{errors.cardCvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <p className="flex items-center gap-2 text-xs text-zinc-500 pt-2">
                  <Lock className="h-3.5 w-3.5" />
                  Compra 100% discreta, embalagem sem identificação do conteúdo.
                </p>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl shadow-xl p-6 h-fit lg:sticky lg:top-24">
            <CardHeader className="mb-6 p-0">
              <CardTitle className="text-xl font-bold text-zinc-50">Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="border-b border-zinc-800 pb-4 mb-4 space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-zinc-300 min-w-0">
                    <div className="flex items-center min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-12 h-12 object-cover rounded-md mr-3 bg-zinc-800 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-zinc-500">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="tabular-nums flex-shrink-0">
                      R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between font-bold text-xl mb-6 text-zinc-50">
                <span>Total:</span>
                <span className="text-fuchsia-400 tabular-nums">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className={cn(
                  "w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold h-11 rounded-lg transition-colors active:scale-[0.98]",
                  submitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {submitting ? "Confirmando..." : "Confirmar pedido"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}