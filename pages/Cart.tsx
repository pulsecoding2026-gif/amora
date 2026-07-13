import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  };

  const handleCheckout = () => {
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=/checkout");
    }
  };

  return (
    <div className="min-h-[calc(100dvh-12rem)] pt-28 md:pt-32 pb-16 px-6 lg:px-8 max-w-6xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-10 text-center [text-wrap:balance]">
        Seu carrinho
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-md mx-auto text-center">
          <div className="h-14 w-14 rounded-full bg-fuchsia-500/15 flex items-center justify-center mb-5">
            <ShoppingBag className="h-6 w-6 text-fuchsia-400" />
          </div>
          <p className="text-zinc-400 text-base leading-relaxed mb-6">
            Seu carrinho está vazio no momento. Explore nossa seleção e encontre algo especial para você.
          </p>
          <Link to="/">
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white active:scale-[0.98] transition">
              Explorar produtos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 w-full">
          <div className="lg:col-span-2 space-y-4 min-w-0">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-4 flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-xl bg-zinc-800 flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-grow min-w-0">
                  <h2 className="text-base font-semibold text-zinc-100 truncate">{item.product.name}</h2>
                  <p className="text-zinc-500 text-sm">{item.product.category}</p>
                  <p className="text-fuchsia-400 font-semibold tabular-nums mt-1">
                    R$ {formatBRL(item.product.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
                    aria-label={`Diminuir quantidade de ${item.product.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-zinc-100 font-medium w-6 text-center tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
                    aria-label={`Aumentar quantidade de ${item.product.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-fuchsia-400 transition flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
                  aria-label={`Remover ${item.product.name} do carrinho`}
                >
                  <X className="h-5 w-5" />
                </button>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-1 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 self-start lg:sticky lg:top-24">
            <CardTitle className="text-xl font-bold text-zinc-100">Resumo do pedido</CardTitle>
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Subtotal</span>
                <span className="tabular-nums">R$ {formatBRL(total)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Frete</span>
                <span className="tabular-nums">Calculado no checkout</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-zinc-100 border-t border-zinc-800 pt-4 mt-2">
                <span>Total</span>
                <span className="tabular-nums text-fuchsia-400">R$ {formatBRL(total)}</span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white mt-4 h-11 text-base active:scale-[0.98] transition"
            >
              Finalizar compra
            </Button>
            <Link
              to="/"
              className="block text-center text-sm text-zinc-500 hover:text-fuchsia-400 transition pt-1"
            >
              Continuar comprando
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}