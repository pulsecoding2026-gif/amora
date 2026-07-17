import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Lock, Loader2, Copy, CheckCircle, QrCode } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PROJECT_ID = "a8b20a27-a24e-4999-a50a-1c4273c858bc";

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function invoke(name: string, payload: Record<string, unknown>) {
  const res = await fetch("https://pulse-hub-ia.vercel.app/api/app/edge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: PROJECT_ID, action: "invoke", name, payload }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new Error(json?.error || "Não foi possível concluir a operação. Tente novamente.");
  }
  return json.result;
}

interface Order {
  id: string;
  userId: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  customerName: string;
  createdAt: number;
  status: "pago";
}

interface FormErrors {
  name?: string;
  cpf?: string;
}

type Step = "form" | "payment" | "success";

function formatCpf(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 9));
  let out = parts.join(".");
  if (digits.length > 9) out += `-${digits.slice(9, 11)}`;
  return out;
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const safeTotal = toNumber(total, 0);

  const [step, setStep] = useState<Step>("form");

  const [name, setName] = useState(user?.name || "");
  const [cpf, setCpf] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    }
  }, [user, navigate]);

  // Polling do status do pagamento PIX
  useEffect(() => {
    if (step !== "payment" || !paymentId) return;

    intervalRef.current = setInterval(async () => {
      try {
        const result = await invoke("pix-status", { paymentId });
        if (result?.paid) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          if (user) {
            const newOrder: Order = {
              id: paymentId,
              userId: user.id,
              items: items.map((item) => ({
                id: item.id,
                name: item.name,
                price: toNumber(item.price, 0),
                quantity: toNumber(item.quantity, 1),
              })),
              total: safeTotal,
              customerName: name.trim(),
              createdAt: Date.now(),
              status: "pago",
            };

            try {
              const existingOrders = JSON.parse(localStorage.getItem("amora_orders") || "[]") as Order[];
              localStorage.setItem("amora_orders", JSON.stringify([...existingOrders, newOrder]));
            } catch {
              // localStorage indisponível — segue o fluxo mesmo assim
            }

            setCompletedOrder(newOrder);
            clearCart();
            setStep("success");
          }
        }
      } catch (err) {
        setStatusError(
          err instanceof Error ? err.message : "Não foi possível verificar o status do pagamento."
        );
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [step, paymentId, items, safeTotal, name, user, clearCart]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const validateField = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (field === "name") {
        next.name = name.trim().length < 3 ? "Informe seu nome completo." : undefined;
      }
      if (field === "cpf") {
        const digits = cpf.replace(/\D/g, "");
        next.cpf = digits.length !== 11 ? "CPF inválido. Deve conter 11 dígitos." : undefined;
      }
      return next;
    });
  };

  const validateAll = (): boolean => {
    const next: FormErrors = {};
    if (name.trim().length < 3) next.name = "Informe seu nome completo.";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) next.cpf = "CPF inválido. Deve conter 11 dígitos.";
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleGenerateQrCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) return;

    if (!validateAll()) return;

    setGenerating(true);
    setGenerateError(null);

    try {
      const digits = cpf.replace(/\D/g, "");
      const result = await invoke("pix-create", {
        customer: { name: name.trim(), cpf: digits },
        amount: safeTotal,
        description: "Pedido Amora Íntima",
      });

      if (!result?.paymentId || !result?.qrCodeBase64) {
        throw new Error("Resposta inválida ao gerar o Pix. Tente novamente.");
      }

      setPaymentId(result.paymentId);
      setQrCode(result.qrCode || "");
      setQrCodeBase64(result.qrCodeBase64);
      setStatusError(null);
      setStep("payment");
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Não foi possível gerar o QR Code Pix. Tente novamente."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setGenerateError("Não foi possível copiar o código. Copie manualmente.");
    }
  };

  if (!user) {
    return null;
  }

  // Etapa 3: sucesso
  if (step === "success" && completedOrder) {
    const orderTotal = toNumber(completedOrder.total, 0);
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100">
        <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl shadow-xl p-8">
          <CardHeader className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500/15">
              <CheckCircle className="h-8 w-8 text-fuchsia-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-zinc-50 mb-2 [text-wrap:balance]">
              Pagamento confirmado!
            </CardTitle>
            <p className="text-zinc-400">Obrigado(a) pela sua compra, {completedOrder.customerName}.</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 mb-6 text-left">
              <p className="text-sm text-zinc-400">Número do pedido</p>
              <p className="font-mono text-sm text-zinc-100 mb-3 truncate" title={completedOrder.id}>
                {completedOrder.id}
              </p>
              <ul className="space-y-2 mb-3 border-t border-zinc-800 pt-3">
                {completedOrder.items.map((item) => {
                  const itemPrice = toNumber(item.price, 0);
                  const itemQty = toNumber(item.quantity, 1);
                  return (
                    <li key={item.id} className="flex items-center justify-between gap-3 text-sm text-zinc-300 min-w-0">
                      <span className="truncate">{item.name} × {itemQty}</span>
                      <span className="tabular-nums flex-shrink-0">
                        R$ {(itemPrice * itemQty).toFixed(2).replace(".", ",")}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-sm text-zinc-400">Total pago via Pix</p>
              <p className="text-lg font-semibold text-fuchsia-400 tabular-nums">
                R$ {orderTotal.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              Você receberá atualizações do envio por e-mail. A entrega é discreta, sem identificação do conteúdo na
              embalagem.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold h-11 rounded-lg transition-colors active:scale-[0.98]"
            >
              Voltar à loja
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

  // Etapa 2: pagamento (QR code + polling)
  if (step === "payment" && qrCodeBase64) {
    return (
      <div className="min-h-dvh pt-24 pb-12 bg-zinc-950 text-zinc-100 antialiased">
        <div className="max-w-lg mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-50 leading-[1.1] mb-2 [text-wrap:balance]">
            Pague com Pix
          </h1>
          <p className="text-zinc-400 mb-8">
            Escaneie o QR Code no app do seu banco ou copie o código abaixo.
          </p>

          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl shadow-xl p-6">
            <CardContent className="p-0">
              <div className="mx-auto mb-6 aspect-square w-56 overflow-hidden rounded-xl bg-zinc-800 flex items-center justify-center">
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt="QR Code para pagamento Pix"
                  className="h-full w-full object-cover"
                />
              </div>

              {qrCode && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-zinc-300 mb-1">Código copia e cola</p>
                  <div
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 font-mono text-xs text-zinc-300 truncate"
                    title={qrCode}
                  >
                    {qrCode}
                  </div>
                </div>
              )}

              <Button
                onClick={handleCopyCode}
                className={cn(
                  "w-full h-11 rounded-lg font-semibold transition-colors active:scale-[0.98] mb-6 flex items-center justify-center gap-2",
                  copied
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
                )}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copiar código PIX
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 py-3 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-fuchsia-400" />
                Aguardando pagamento...
              </div>

              {statusError && (
                <p className="text-sm text-red-500 mt-3 text-center">{statusError}</p>
              )}

              <div className="flex justify-between font-semibold text-lg mt-6 pt-4 border-t border-zinc-800 text-zinc-50">
                <span>Total:</span>
                <span className="text-fuchsia-400 tabular-nums">R$ {safeTotal.toFixed(2).replace(".", ",")}</span>
              </div>
            </CardContent>
          </Card>

          <p className="flex items-center justify-center gap-2 text-xs text-zinc-500 mt-6">
            <Lock className="h-3.5 w-3.5" />
            Compra 100% discreta, embalagem sem identificação do conteúdo.
          </p>
        </div>
      </div>
    );
  }

  // Etapa 1: formulário
  return (
    <div className="min-h-dvh pt-24 pb-12 bg-zinc-950 text-zinc-100 antialiased">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-50 leading-[1.1] mb-10 [text-wrap:balance]">
          Finalizar compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl shadow-xl p-6">
            <CardHeader className="mb-6 p-0">
              <CardTitle className="text-xl font-bold text-zinc-50 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-fuchsia-400" />
                Pagamento via Pix
              </CardTitle>
              <p className="text-sm text-zinc-400 mt-1">
                Informe seus dados para gerar o código Pix. O pagamento é processado em ambiente seguro pelo Asaas.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleGenerateQrCode} noValidate className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    maxLength={100}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => validateField("name")}
                    className={cn(
                      "w-full px-4 py-2 border rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors",
                      errors.name ? "border-red-500" : "border-zinc-700"
                    )}
                    placeholder="Como no seu documento"
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-zinc-300 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    id="cpf"
                    value={cpf}
                    inputMode="numeric"
                    maxLength={14}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    onBlur={() => validateField("cpf")}
                    className={cn(
                      "w-full px-4 py-2 border rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none h-11 transition-colors tabular-nums",
                      errors.cpf ? "border-red-500" : "border-zinc-700"
                    )}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>}
                </div>

                <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/60">
                  <p className="text-zinc-200 font-medium text-sm">Como funciona</p>
                  <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                    Ao clicar em "Gerar QR Code PIX", geraremos um código válido por tempo limitado. Basta escanear no
                    app do seu banco ou copiar o código para concluir o pagamento.
                  </p>
                </div>

                {generateError && (
                  <p className="text-sm text-red-500">{generateError}</p>
                )}

                <Button
                  type="submit"
                  disabled={generating}
                  className={cn(
                    "w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold h-11 rounded-lg transition-colors active:scale-[0.98] flex items-center justify-center gap-2",
                    generating && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Gerando QR Code...
                    </>
                  ) : (
                    "Gerar QR Code PIX"
                  )}
                </Button>

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
                {items.map((item) => {
                  const itemPrice = toNumber(item.price, 0);
                  const itemQty = toNumber(item.quantity, 1);
                  return (
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
                          <p className="text-sm text-zinc-500">Qtd: {itemQty}</p>
                        </div>
                      </div>
                      <span className="tabular-nums flex-shrink-0">
                        R$ {(itemPrice * itemQty).toFixed(2).replace(".", ",")}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="flex justify-between font-bold text-xl mb-2 text-zinc-50">
                <span>Total:</span>
                <span className="text-fuchsia-400 tabular-nums">R$ {safeTotal.toFixed(2).replace(".", ",")}</span>
              </div>
              <p className="text-xs text-zinc-500">Pagamento processado via Pix (Asaas).</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}