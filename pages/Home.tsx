import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Reviews from "@/components/Reviews";
import { products, ProductCategory } from "@/data/products";
import {
  Package,
  CreditCard,
  ShieldCheck,
  Truck,
  Flame,
  ArrowRight,
} from "lucide-react";

// Mantém sincronia exata com os slugs usados no Navbar/Footer:
// /vibradores, /lingerie, /cosmeticos, /casais, /acessorios
const slugToCategory: Record<string, ProductCategory> = {
  vibradores: "Vibradores",
  lingerie: "Lingerie",
  cosmeticos: "Cosméticos",
  casais: "Casais",
  acessorios: "Acessórios",
};

export default function Home() {
  const { categoria } = useParams<{ categoria?: string }>();

  const initialCategory: ProductCategory | "Todos" =
    (categoria && slugToCategory[categoria.toLowerCase()]) || "Todos";

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "Todos">(
    initialCategory
  );

  useEffect(() => {
    if (!categoria) return;

    const mapped = slugToCategory[categoria.toLowerCase()];
    // Slug reconhecido (bate com o menu): aplica o filtro e leva até a vitrine.
    // Slug desconhecido: não filtra nada (mostra lista completa), sem quebrar a página.
    setSelectedCategory(mapped || "Todos");

    if (mapped) {
      const vitrine = document.getElementById("vitrine");
      if (vitrine) {
        vitrine.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [categoria]);

  const filteredProducts =
    selectedCategory === "Todos"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const bestSellers = products.slice(0, 4);

  const categories: (ProductCategory | "Todos")[] = [
    "Todos",
    "Vibradores",
    "Lingerie",
    "Cosméticos",
    "Casais",
    "Acessórios",
  ];

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Hero />

      {/* Vitrine Amora — mais vendidos, logo abaixo do hero */}
      <section className="py-24 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-fuchsia-400" />
              <h2 className="text-3xl font-bold tracking-tight [text-wrap:balance]">
                Vitrine Amora
              </h2>
            </div>
            <a
              href="#vitrine"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
            >
              Ver vitrine completa <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Vitrine com filtros */}
      <section id="vitrine" className="py-24 bg-zinc-950 border-b border-zinc-900 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-4xl font-bold tracking-tight text-fuchsia-400 mb-4 [text-wrap:balance]">
            Explore por categoria
          </h2>
          <p className="text-center text-zinc-400 max-w-[55ch] mx-auto mb-12">
            Encontre o item perfeito para o seu momento.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400
                  ${
                    selectedCategory === category
                      ? "bg-fuchsia-600 text-white shadow-lg"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-zinc-400 text-xl">
                Nenhum produto encontrado para "{selectedCategory}".
              </p>
              <button
                onClick={() => setSelectedCategory("Todos")}
                className="mt-6 px-6 py-3 bg-fuchsia-600 text-white rounded-full hover:bg-fuchsia-700 transition font-medium min-h-[44px]"
              >
                Ver todos os produtos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Prazer com discrição do início ao fim — fechamento, antes das avaliações */}
      <section className="py-24 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight [text-wrap:balance] mb-4">
              Prazer com <span className="text-fuchsia-400 italic font-normal">discrição</span> do início ao fim
            </h2>
            <p className="text-zinc-400 leading-relaxed max-w-[65ch]">
              Da embalagem à cobrança no cartão, cada detalhe da sua compra foi pensado para que só você saiba o que chegou na porta de casa.
            </p>
          </div>

          <div className="divide-y divide-zinc-800 border-t border-zinc-800">
            <div className="grid md:grid-cols-12 gap-4 md:gap-8 py-8 items-start">
              <span className="md:col-span-1 font-mono text-sm text-fuchsia-400/70">01</span>
              <div className="md:col-span-3 flex items-center gap-3">
                <Package className="w-6 h-6 text-fuchsia-400 shrink-0" />
                <h3 className="text-lg font-semibold">Embalagem discreta</h3>
              </div>
              <p className="md:col-span-8 text-zinc-400 leading-relaxed max-w-[65ch]">
                Caixa neutra, sem logo ou descrição do conteúdo, e remetente genérico na etiqueta — ninguém além de você sabe o que está dentro.
              </p>
            </div>
            <div className="grid md:grid-cols-12 gap-4 md:gap-8 py-8 items-start">
              <span className="md:col-span-1 font-mono text-sm text-fuchsia-400/70">02</span>
              <div className="md:col-span-3 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-fuchsia-400 shrink-0" />
                <h3 className="text-lg font-semibold">Cobrança sigilosa</h3>
              </div>
              <p className="md:col-span-8 text-zinc-400 leading-relaxed max-w-[65ch]">
                Na fatura do cartão aparece apenas um nome fantasia neutro, sem qualquer referência à loja ou aos produtos comprados.
              </p>
            </div>
            <div className="grid md:grid-cols-12 gap-4 md:gap-8 py-8 items-start">
              <span className="md:col-span-1 font-mono text-sm text-fuchsia-400/70">03</span>
              <div className="md:col-span-3 flex items-center gap-3">
                <Truck className="w-6 h-6 text-fuchsia-400 shrink-0" />
                <h3 className="text-lg font-semibold">Entrega rápida</h3>
              </div>
              <p className="md:col-span-8 text-zinc-400 leading-relaxed max-w-[65ch]">
                Despacho em até 24h úteis e rastreio disponível — você acompanha tudo sem precisar dar explicações a ninguém.
              </p>
            </div>
            <div className="grid md:grid-cols-12 gap-4 md:gap-8 py-8 items-start">
              <span className="md:col-span-1 font-mono text-sm text-fuchsia-400/70">04</span>
              <div className="md:col-span-3 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-fuchsia-400 shrink-0" />
                <h3 className="text-lg font-semibold">+18 anos, com consciência</h3>
              </div>
              <p className="md:col-span-8 text-zinc-400 leading-relaxed max-w-[65ch]">
                Produtos selecionados para o bem-estar e o prazer adulto, com informações claras de uso e procedência garantida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] [text-wrap:balance] mb-5">
            Seu prazer merece ser <span className="text-fuchsia-400 italic font-normal">descoberto</span> com liberdade
          </h2>
          <p className="text-zinc-400 max-w-[55ch] mx-auto mb-8 leading-relaxed">
            Escolha seus produtos agora e receba em casa com total sigilo, do pagamento à embalagem.
          </p>
          <a
            href="#vitrine"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 px-8 py-3.5 bg-fuchsia-600 text-white rounded-full font-medium hover:bg-fuchsia-700 active:scale-[0.98] transition-all duration-200"
          >
            Explorar produtos <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Comentários e avaliações — última seção da página */}
      <Reviews />
    </div>
  );
}