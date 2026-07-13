import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-0 overflow-hidden bg-zinc-950">
      {/* Foto de fundo — clima da marca, sutil e elegante */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692273251-0-hero.jpg')",
        }}
        role="img"
        aria-label="Tecido de seda drapejado em tons de vinho e ameixa, ambiente íntimo e elegante"
      ></div>

      {/* Overlay escuro para legibilidade + tonalidade da marca */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/70 to-zinc-950/95"></div>
      <div
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
        }}
      ></div>

      <div className="relative z-10 text-center max-w-4xl mx-auto py-24 sm:py-32">
        <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-zinc-50 tracking-tight leading-[1.1] mb-6 drop-shadow-md [text-wrap:balance]">
          Segredos Partilhados, Prazer sem Tabus
        </h1>
        <p className="text-lg sm:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Explore uma coleção cuidadosamente selecionada para despertar seus sentidos e aprofundar suas conexões íntimas.
        </p>
        <Button asChild className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 ease-out active:scale-[0.98]">
          <Link to="/" className="no-underline">Explorar Coleção</Link>
        </Button>
      </div>
    </section>
  );
};

export default Hero;