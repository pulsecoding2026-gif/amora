import { Star } from "lucide-react";

interface Review {
  initials: string;
  name: string;
  context: string;
  text: string;
}

const reviews: Review[] = [
  {
    initials: "MC",
    name: "Mariana C.",
    context: "Compra verificada • há 2 semanas",
    text: "Cheguei a duvidar da discrição, mas a caixa chegou sem nenhuma identificação, embalagem neutra e o produto impecável. Recomendo de olhos fechados.",
  },
  {
    initials: "RF",
    name: "Rafael F.",
    context: "Compra verificada • há 1 mês",
    text: "Atendimento super educado e reservado, nem parecia que eu tinha comprado algo íntimo. Entrega rápida e sigilosa, exatamente como prometido.",
  },
  {
    initials: "JS",
    name: "Juliana S.",
    context: "Compra verificada • há 3 semanas",
    text: "Qualidade acima do que eu esperava pelo preço. O corselet veio muito bem embalado e a nota fiscal não constava nenhum detalhe do conteúdo.",
  },
  {
    initials: "TP",
    name: "Thiago P.",
    context: "Compra verificada • há 5 dias",
    text: "Já é a terceira vez que compro e todas as vezes a experiência foi impecável: envio sigiloso, prazo cumprido e produtos de ótima qualidade.",
  },
];

export default function Reviews() {
  return (
    <section className="bg-zinc-950 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-50 [text-wrap:balance]">
              O que dizem nossos clientes
            </h2>
            <p className="mt-3 text-zinc-400 leading-relaxed max-w-[60ch]">
              Experiências reais de quem já viveu o cuidado e a discrição da Amora, do pedido à entrega.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="text-5xl font-bold text-zinc-50 tabular-nums leading-none">
              4,9
              <span className="text-2xl text-zinc-500">/5</span>
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1" aria-label="Avaliação 4,9 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-fuchsia-400 text-fuchsia-400"
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500">
                1.847 avaliações verificadas
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-center gap-3 mb-4 min-w-0">
                <div className="h-11 w-11 shrink-0 rounded-full bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center font-semibold text-sm">
                  {review.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-zinc-100 font-medium truncate">
                    {review.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {review.context}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-fuchsia-400 text-fuchsia-400"
                  />
                ))}
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed max-w-[65ch]">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}