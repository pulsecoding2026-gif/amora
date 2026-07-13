import React, { useState } from 'react';
import { products, ProductCategory } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/lib/utils';

const productCategories: ProductCategory[] = ['Vibradores', 'Lingerie', 'Cosméticos', 'Casais', 'Acessórios'];

interface ProductGridProps {
  title?: string;
}

export default function ProductGrid({ title }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <section className="py-16 md:py-24 bg-zinc-900 text-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        {title && (
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-12 font-playfair leading-[1.1]">
            {title}
          </h2>
        )}

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200",
              selectedCategory === 'Todos'
                ? "bg-fuchsia-600 text-white shadow-md"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            )}
          >
            Todos
          </button>
          {productCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                selectedCategory === category
                  ? "bg-fuchsia-600 text-white shadow-md"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-zinc-400">Nenhum produto encontrado para a categoria "{selectedCategory}".</p>
            <p className="text-lg text-zinc-500 mt-4">Experimente selecionar "Todos" para ver as opções.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}