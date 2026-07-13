import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import ProtectedRoute from "@/components/ProtectedRoute";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import LoginPage from "@/pages/Login";
import Checkout from "@/pages/Checkout";
import Admin from "@/pages/Admin";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Componente de layout padrão para páginas públicas
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-dvh bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Rotas públicas com layout padrão */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />

            <Route
              path="/produto/:id"
              element={
                <MainLayout>
                  <ProductDetail />
                </MainLayout>
              }
            />
            <Route
              path="/carrinho"
              element={
                <MainLayout>
                  <Cart />
                </MainLayout>
              }
            />
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas protegidas (exigem login) */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/checkout"
                element={
                  <MainLayout>
                    <Checkout />
                  </MainLayout>
                }
              />
            </Route>

            {/* Rota de Admin protegida (exige login e ser admin), sem o MainLayout público.
                Usa /admin/* para permitir sub-rotas internas do próprio Admin (ex.: dashboard de vendas),
                todas renderizadas com o layout PRÓPRIO do componente Admin. */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin/*" element={<Admin />} />
            </Route>

            {/* Rotas explícitas de categoria — usadas pelo Navbar e Footer (/vibradores, /lingerie,
                /cosmeticos, /casais, /acessorios). Reaproveitam a Home, que lê o slug via useParams
                e mapeia para a categoria correspondente (slugToCategory), aplicando o filtro e
                rolando até a vitrine. Ficam DEPOIS das rotas explícitas (/produto/:id, /carrinho,
                /login, /checkout, /admin) para que elas tenham prioridade. */}
            <Route
              path="/vibradores"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            <Route
              path="/lingerie"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            <Route
              path="/cosmeticos"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            <Route
              path="/casais"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            <Route
              path="/acessorios"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />

            {/* Rota 404 */}
            <Route
              path="*"
              element={
                <MainLayout>
                  <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">
                      Página não encontrada
                    </h1>
                    <p className="text-zinc-400 max-w-[65ch]">
                      O endereço que você tentou acessar não existe ou foi movido.
                    </p>
                  </div>
                </MainLayout>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}