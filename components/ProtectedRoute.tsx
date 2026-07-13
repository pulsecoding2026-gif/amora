import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Renderiza um spinner enquanto o estado de autenticação está carregando
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.24))] text-zinc-400">
        <svg className="animate-spin h-8 w-8 mr-3 text-fuchsia-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Carregando...
      </div>
    );
  }

  if (!user) {
    // Sem usuário autenticado: envia para /login preservando o destino original
    // tanto via query string (?redirect=) quanto via state (location.state.from),
    // para o Login funcionar com qualquer uma das duas estratégias.
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
        state={{ from: location }}
      />
    );
  }

  if (adminOnly && !user.isAdmin) {
    // Usuário autenticado mas sem permissão de admin: volta para a home.
    return <Navigate to="/" replace />;
  }

  // Como o estado de auth é lido de forma síncrona (localStorage) no Provider,
  // após um login de admin bem-sucedido este guard já lê o mesmo user do
  // Context atualizado e libera o acesso a /admin imediatamente.
  return <Outlet />;
}