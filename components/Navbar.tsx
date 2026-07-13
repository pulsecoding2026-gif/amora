import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, User, X, ChevronDown, LogOut, Package, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { ProductCategory } from "@/data/products";

const categories: { name: ProductCategory; slug: string }[] = [
  { name: "Vibradores", slug: "vibradores" },
  { name: "Lingerie", slug: "lingerie" },
  { name: "Cosméticos", slug: "cosmeticos" },
  { name: "Casais", slug: "casais" },
  { name: "Acessórios", slug: "acessorios" },
];

const AgeVerificationModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-lg bg-zinc-800 p-6 text-center shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">Confirmação de Idade</h2>
        <p className="mb-6 text-zinc-300">Este site contém conteúdo adulto. Você tem 18 anos ou mais?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-md bg-fuchsia-700 px-4 py-2 text-zinc-100 transition-colors hover:bg-fuchsia-800 min-h-[44px]"
          >
            Sim, tenho 18+
          </button>
          <a
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-md border border-zinc-600 px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-700 min-h-[44px] flex items-center justify-center"
          >
            Não
          </a>
        </div>
      </div>
    </div>
  );
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { items } = useCart();
  const { user, logout } = useAuth();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const accountRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasVerifiedAge = localStorage.getItem("amora_age_verified");
    if (!hasVerifiedAge) {
      setShowAgeVerification(true);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fecha o menu mobile automaticamente se a tela for redimensionada para desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAgeVerificationClose = () => {
    localStorage.setItem("amora_age_verified", "true");
    setShowAgeVerification(false);
  };

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleToggleAccount = () => {
    setIsAccountOpen((prev) => !prev);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleGoToAdmin = () => {
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/admin");
  };

  // Rola suavemente até a vitrine de produtos, tentando algumas vezes
  // caso a seção ainda não tenha sido renderizada logo após a navegação.
  const scrollToVitrine = () => {
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById("vitrine");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts < 10) {
        attempts += 1;
        window.setTimeout(tryScroll, 60);
      }
    };
    tryScroll();
  };

  // Navega para a rota de categoria (que a Home usa para filtrar a vitrine)
  // e rola até a seção da vitrine, mesmo já estando na mesma rota.
  // As rotas de categoria são declaradas no App.tsx como /vibradores, /lingerie,
  // /cosmeticos, /casais e /acessorios (sem prefixo "/categoria/"), então os
  // links precisam apontar exatamente para esses caminhos.
  const handleCategoryClick = (slug: string) => {
    setIsMobileMenuOpen(false);
    const target = `/${slug}`;
    if (location.pathname === target) {
      scrollToVitrine();
    } else {
      navigate(target);
      window.setTimeout(scrollToVitrine, 80);
    }
  };

  // O total de itens é a soma das quantidades de cada produto no carrinho
  const totalItemsInCart = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-800 bg-zinc-950 p-4 text-zinc-100 shadow-lg md:px-6">
      {showAgeVerification && <AgeVerificationModal onClose={handleAgeVerificationClose} />}

      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="text-3xl font-bold text-zinc-100" style={{ fontFamily: "'Playfair Display', serif" }}>
          Amora
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => handleCategoryClick(category.slug)}
              className="text-base text-zinc-300 transition-colors hover:text-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 rounded-sm"
            >
              {category.name}
            </button>
          ))}
          <Link
            to="/carrinho"
            className="relative flex h-11 w-11 items-center justify-center rounded-md text-zinc-300 transition-colors hover:text-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
            aria-label="Carrinho de compras"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItemsInCart > 0 && (
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">
                {totalItemsInCart}
              </span>
            )}
          </Link>

          {/* Account dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={handleToggleAccount}
              className="flex h-11 items-center gap-2 rounded-md px-2 text-zinc-300 transition-colors hover:text-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
              aria-haspopup="true"
              aria-expanded={isAccountOpen}
            >
              <User className="h-6 w-6" />
              <span className="max-w-[120px] truncate">{user ? user.name : "Minha Conta"}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isAccountOpen ? "rotate-180" : ""}`} />
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 py-2 shadow-2xl">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <p className="text-sm font-medium text-zinc-100 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/checkout"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-fuchsia-400"
                    >
                      <Package className="h-4 w-4" />
                      Meus pedidos
                    </Link>
                    {user.isAdmin && (
                      <button
                        type="button"
                        onClick={handleGoToAdmin}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-500 hover:bg-zinc-800 hover:text-fuchsia-400"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Painel admin
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-fuchsia-400"
                    >
                      Entrar / Cadastrar
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button and cart icons */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/carrinho"
            className="relative flex h-11 w-11 items-center justify-center rounded-md text-zinc-300 transition-colors hover:text-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
            aria-label="Carrinho de compras"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItemsInCart > 0 && (
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">
                {totalItemsInCart}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={handleToggleMobileMenu}
            className="flex h-11 w-11 items-center justify-center rounded-md text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute left-0 right-0 top-full z-40 max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-zinc-800 bg-zinc-900 pb-4 md:hidden"
        >
          <ul className="flex flex-col gap-1 px-4 py-4">
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(category.slug)}
                  className="flex min-h-[44px] w-full items-center text-left text-lg text-zinc-300 transition-colors hover:text-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 rounded-sm"
                >
                  {category.name}
                </button>
              </li>
            ))}
            <li className="border-t border-zinc-700 pt-4 mt-2">
              {user ? (
                <div className="flex flex-col gap-1">
                  <p className="px-1 pb-2 text-sm text-zinc-500 truncate">Olá, {user.name}</p>
                  <Link
                    to="/checkout"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-2 text-lg text-zinc-300 transition-colors hover:text-fuchsia-400"
                  >
                    <Package className="h-5 w-5" />
                    Meus pedidos
                  </Link>
                  {user.isAdmin && (
                    <button
                      type="button"
                      onClick={handleGoToAdmin}
                      className="flex min-h-[44px] w-full items-center gap-2 text-left text-lg text-zinc-500 transition-colors hover:text-fuchsia-400"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      Painel admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-[44px] w-full items-center gap-2 text-left text-lg text-red-400"
                  >
                    <LogOut className="h-5 w-5" />
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex min-h-[44px] w-full items-center justify-center rounded-md bg-fuchsia-700 px-4 text-center text-lg text-zinc-100 transition-colors hover:bg-fuchsia-800"
                  >
                    Entrar / Cadastrar
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}