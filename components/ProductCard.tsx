import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Product } from '@/data/products';
import { useCart } from '@/lib/cart';
import { CheckCircle, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique no botão navegue para a página do produto
    addItem(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000); // Resetar o estado "added" após 2 segundos
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden group rounded-2xl border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-md",
        "hover:border-fuchsia-500 transition-all duration-300 ease-out cursor-pointer"
      )}
      onClick={() => navigate(`/produto/${product.id}`)}
    >
      <div className="aspect-square w-full overflow-hidden bg-zinc-800">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          width={400}
          height={400}
        />
      </div>
      <div className="p-4 flex flex-col items-start">
        <span className="text-xs text-zinc-400 uppercase tracking-widest mb-1">
          {product.category}
        </span>
        <h3 className="text-lg font-semibold text-zinc-50 mb-2 leading-tight">
          {product.name}
        </h3>
        <p className="text-zinc-300 font-mono text-xl tabular-nums font-bold mb-4">
          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <Button
          onClick={handleAddToCart}
          className={cn(
            "w-full group/button relative overflow-hidden transition-all duration-200 py-2 px-4 rounded-xl active:scale-[0.98]",
            added
              ? "bg-zinc-700 text-zinc-100 flex items-center justify-center cursor-not-allowed"
              : "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          )}
          disabled={added}
        >
          {added ? (
            <span className="flex items-center gap-2">
              <CheckCircle size={18} />
              Adicionado!
            </span>
          ) : (
            <>
              <Plus size={18} className="mr-2" />
              Adicionar ao Carrinho
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}