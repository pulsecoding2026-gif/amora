import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { products, Product, ProductCategory } from "@/data/products";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Lock,
  Truck,
  PackageCheck,
  Star,
  ShieldCheck,
  ChevronRight,
  Info,
  MessageSquare,
} from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const reviews = [
  {
    name: "Camila R.",
    rating: 5,
    date: "há 2 semanas",
    text: "Chegou numa caixa completamente neutra, ninguém desconfiou de nada. O produto em si superou minhas expectativas — qualidade impecável.",
  },
  {
    name: "Bruno & Ana",
    rating: 5,
    date: "há 1 mês",
    text: "Usamos a dois e foi uma experiência incrível. Material macio, silencioso e a bateria dura bastante. Recomendo muito.",
  },
  {
    name: "Juliana M.",
    rating: 4,
    date: "há 3 meses",
    text: "Muito bom custo-benefício. Só acho que a embalagem interna poderia vir com um saquinho extra, mas nada que comprometa.",
  },
  {
    name: "Rafael T.",
    rating: 5,
    date: "há 4 meses",
    text: "Discrição impecável do início ao fim — do site até a entrega. Já é a terceira compra e nunca tive nenhum problema.",
  },
];

const characteristics = [
  "Material: silicone de grau médico hipoalergênico",
  "Impermeável: sim, 100% à prova d'água",
  "Recarregável via cabo USB (autonomia de até 2h)",
  "Baixo ruído para máxima discrição",
  "Acompanha bolsa de veludo e manual em português",
];

// Mapa de categoria -> slug de rota, igual ao usado no Navbar/Home
const categoryToSlug: Record<ProductCategory, string> = {
  Vibradores: "vibradores",
  Lingerie: "lingerie",
  Cosméticos: "cosmeticos",
  Casais: "casais",
  Acessórios: "acessorios",
};

type Tab = "detalhes" | "avaliacoes";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<"success" | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("detalhes");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === id) || null;
    setProduct(foundProduct);
    setQuantity(1);
    setFeedback(null);
    setActiveTab("detalhes");
    setActiveImage(0);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product.id, quantity);
      setFeedback("success");
      setTimeout(() => {
        setFeedback(null);
        navigate("/carrinho");
      }, 1200);
    }
  };

  if (!product) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100">
        <h1 className="text-5xl font-bold tracking-tight text-fuchsia-400 mb-4">
          Oops!
        </h1>
        <p className="text-xl mb-8 text-zinc-300">
          Produto não encontrado, ou talvez seja um segredo bem guardado.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-300"
        >
          Voltar à Amora
        </Button>
      </div>
    );
  }

  const installmentValue = (product.price * quantity) / 3;
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const categorySlug = categoryToSlug[product.category] ?? "";

  // Galeria: usa a imagem principal do produto para todas as miniaturas
  // (fonte única disponível), variando levemente o enquadramento visual.
  const gallery = [product.image, product.image, product.image];

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-dvh pt-20 pb-12">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link to="/" className="hover:text-fuchsia-400 transition-colors">
            Início
          </Link>
          <ChevronRight size={12} />
          <Link
            to={`/${categorySlug}`}
            className="hover:text-fuchsia-400 transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-zinc-300 truncate max-w-[180px]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ===== PARTE DE CIMA: galeria + bloco de compra ===== */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start py-8">
        {/* Galeria */}
        <div className="lg:sticky lg:top-24">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl shadow-black/40">
            <img
              src={gallery[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-sm border border-zinc-700 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs text-zinc-200">
              <Lock size={12} className="text-fuchsia-400" />
              Embalagem 100% discreta
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                aria-label={`Ver imagem ${i + 1} de ${product.name}`}
                className={`aspect-square rounded-xl overflow-hidden bg-zinc-800 border transition-colors duration-200 ${
                  activeImage === i
                    ? "border-fuchsia-500"
                    : "border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Bloco de compra */}
        <div className="flex flex-col gap-6 min-w-0">
          <div>
            <p className="text-fuchsia-400 text-sm uppercase tracking-wider font-medium mb-2">
              {product.category}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-white [text-wrap:balance]">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex text-fuchsia-400">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={16} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm text-zinc-400">
              4,8 de 5 · 327 avaliações
            </span>
          </div>

          <p className="text-zinc-300 text-base leading-relaxed max-w-[65ch]">
            {product.description}
          </p>

          <div className="border-t border-b border-zinc-800 py-5">
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-4xl font-bold tabular-nums text-fuchsia-400">
                R$ {(product.price * quantity).toFixed(2).replace(".", ",")}
              </span>
              {quantity > 1 && (
                <span className="text-sm text-zinc-500 mb-1">
                  (R$ {product.price.toFixed(2).replace(".", ",")} cada)
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mt-1.5 tabular-nums">
              ou 3x de R$ {installmentValue.toFixed(2).replace(".", ",")} sem juros
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center border border-zinc-700 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="text-zinc-400 hover:text-white px-3 py-2 min-w-[44px] min-h-[44px]"
                aria-label="Diminuir quantidade"
              >
                <Minus size={18} />
              </Button>
              <span className="w-10 text-center text-lg font-semibold tabular-nums">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                className="text-zinc-400 hover:text-white px-3 py-2 min-w-[44px] min-h-[44px]"
                aria-label="Aumentar quantidade"
              >
                <Plus size={18} />
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              className={`flex-1 min-w-[200px] font-semibold py-3 px-6 rounded-xl transition-all duration-300 active:scale-[0.98] ${
                feedback === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
              }`}
            >
              {feedback === "success" ? (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Adicionado!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Adicionar ao carrinho
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="border border-zinc-700 rounded-xl w-12 h-12 text-zinc-400 hover:text-fuchsia-400 hover:border-fuchsia-600 transition-colors duration-200"
              aria-label="Adicionar aos favoritos"
            >
              <Heart size={20} />
            </Button>
          </div>

          {feedback === "success" && (
            <p className="text-emerald-400 text-sm -mt-2">
              Item adicionado ao carrinho!
            </p>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-start gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <Lock size={18} className="text-fuchsia-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100">Total privacidade</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Embalagem sem identificação e remetente neutro
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <Truck size={18} className="text-fuchsia-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100">Frete rápido</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Envio em até 24h úteis para todo o Brasil
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <ShieldCheck size={18} className="text-fuchsia-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100">Garantia de 90 dias</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Troca garantida em caso de defeito de fabricação
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PARTE DE BAIXO: detalhes + avaliações em abas ===== */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("detalhes")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === "detalhes"
                  ? "border-fuchsia-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Info size={16} />
              Detalhes do produto
            </button>
            <button
              onClick={() => setActiveTab("avaliacoes")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === "avaliacoes"
                  ? "border-fuchsia-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <MessageSquare size={16} />
              Avaliações
              <span className="text-xs tabular-nums bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">
                327
              </span>
            </button>
          </div>

          {/* Conteúdo: Detalhes */}
          {activeTab === "detalhes" && (
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                    Sobre o produto
                  </h2>
                  <p className="text-zinc-300 leading-relaxed max-w-[65ch]">
                    {product.description} Este produto é cuidadosamente
                    elaborado com os melhores materiais para garantir sua
                    satisfação plena. Desperte seus sentidos e explore novas
                    dimensões do prazer com a segurança e a qualidade que só
                    a Amora oferece. Perfeito para momentos de
                    autoconhecimento ou para compartilhar a dois, cada
                    detalhe foi pensado para proporcionar uma experiência
                    inesquecível e luxuosa.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-fuchsia-500/15 flex items-center justify-center shrink-0">
                        <Lock size={16} className="text-fuchsia-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-100">
                          Discrição garantida
                        </p>
                        <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                          Caixa parda lisa, sem logotipos, remetente neutro
                          ("AM Distribuidora") na nota e na fatura.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-fuchsia-500/15 flex items-center justify-center shrink-0">
                        <Truck size={16} className="text-fuchsia-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-100">
                          Frete e prazos
                        </p>
                        <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                          Capitais em 2 a 5 dias úteis; demais regiões em até
                          10 dias úteis, calculado no carrinho pelo CEP.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t lg:border-t-0 lg:border-l border-zinc-800 pt-6 lg:pt-0 lg:pl-8">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Características
                  </h3>
                  <ul className="space-y-3">
                    {characteristics.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-zinc-300 leading-relaxed"
                      >
                        <PackageCheck
                          size={16}
                          className="text-fuchsia-400 shrink-0 mt-0.5"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo: Avaliações */}
          {activeTab === "avaliacoes" && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Avaliações de clientes
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-fuchsia-400">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-sm text-zinc-400 tabular-nums">
                      4,8 de 5 (327 avaliações)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.name}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(review.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-100 truncate">
                          {review.name}
                        </p>
                        <p className="text-xs text-zinc-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex text-fuchsia-400">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={13}
                          fill={n <= review.rating ? "currentColor" : "none"}
                          className={n <= review.rating ? "" : "text-zinc-700"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Produtos relacionados */}
      {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6">
            Você também pode gostar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((related) => (
              <Link
                key={related.id}
                to={`/produto/${related.id}`}
                className="group block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-fuchsia-600/60 transition-colors duration-200"
              >
                <div className="aspect-square bg-zinc-800 overflow-hidden">
                  <img
                    src={related.image}
                    alt={related.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3.5">
                  <p className="text-xs text-fuchsia-400 uppercase tracking-wide mb-1">
                    {related.category}
                  </p>
                  <p className="text-sm font-medium text-zinc-100 truncate">
                    {related.name}
                  </p>
                  <p className="text-sm font-semibold text-zinc-300 tabular-nums mt-1">
                    R$ {related.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}