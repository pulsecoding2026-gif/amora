import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; general?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirectFromQuery = params.get("redirect");
  const redirectFromState = (location.state as { from?: string } | null)?.from;
  const explicitDestination = redirectFromQuery || redirectFromState || "";

  const validate = () => {
    const newErrors: typeof errors = {};
    if (isRegister && name.trim().length < 2) {
      newErrors.name = "Informe seu nome completo.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Informe um e-mail válido.";
    }
    if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const result = isRegister
        ? await register(email, password, name)
        : await login(email, password);

      if (typeof result === "string" && result) {
        setErrors({ general: "E-mail ou senha inválidos." });
        setLoading(false);
        return;
      }

      const isAdminUser = email.trim().toLowerCase() === "admin@amora.com";
      const destination = explicitDestination || (isAdminUser ? "/admin" : "/");
      navigate(destination, { replace: true });
    } catch (err) {
      setErrors({
        general: isRegister
          ? "Não foi possível criar sua conta. Tente novamente."
          : "E-mail ou senha inválidos.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-zinc-950 text-zinc-100">
      {/* Painel visual da marca */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-fuchsia-900 to-rose-700 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            <pattern
              id="pattern-honeycomb"
              x="0" y="0" width="20" height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M3 11L10 6L17 11L10 16L3 11Z"
                className="stroke-fuchsia-800 fill-transparent stroke-[0.3]"
              />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-honeycomb)" />
          </svg>
        </div>
        <h1 className="font-['Playfair_Display'] text-5xl font-bold tracking-tight text-white mb-8 relative z-10">
          Amora.
        </h1>
        <blockquote className="text-3xl font-semibold leading-relaxed text-fuchsia-100 relative z-10">
          "Onde o desejo floresce e os segredos são partilhados com a alma."
          <p className="text-lg font-normal mt-4 text-fuchsia-200">
            <cite className="block not-italic">— A Equipe Amora</cite>
          </p>
        </blockquote>
        <p className="text-sm text-fuchsia-300 relative z-10">
          Descubra um universo de prazer em total discrição e segurança.
        </p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-16 relative">
        <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800">
          <Link
            to="/"
            className="absolute top-6 left-6 text-zinc-400 hover:text-fuchsia-400 transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Voltar à loja
          </Link>

          <h2 className="text-3xl font-bold text-zinc-100 mb-2 font-['Playfair_Display'] tracking-tight mt-8">
            {isRegister ? "Crie sua conta" : "Bem-vindo(a) de volta"}
          </h2>
          <p className="text-zinc-400 mb-8">
            {isRegister
              ? "Junte-se à comunidade Amora para explorar sem limites."
              : "Acesse sua conta para continuar sua jornada de prazer."}
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  className={`flex h-11 w-full rounded-md border bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
                    errors.name ? "border-red-500" : "border-zinc-700"
                  }`}
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, name: validate().name }))}
                  maxLength={100}
                  autoComplete="name"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                className={`flex h-11 w-full rounded-md border bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
                  errors.email ? "border-red-500" : "border-zinc-700"
                }`}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setErrors((prev) => ({ ...prev, email: validate().email }))}
                maxLength={150}
                autoComplete="email"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                  Senha
                </label>
                {!isRegister && (
                  <Link to="#" className="text-sm text-fuchsia-400 hover:underline">
                    Esqueci minha senha
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`flex h-11 w-full rounded-md border bg-zinc-800 px-3 py-2 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
                    errors.password ? "border-red-500" : "border-zinc-700"
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, password: validate().password }))}
                  minLength={6}
                  maxLength={100}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-fuchsia-400 transition-colors"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>

            {errors.general && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                {errors.general}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 active:scale-[0.98] text-white transition-transform"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRegister ? "Criando conta..." : "Entrando..."}
                </span>
              ) : isRegister ? (
                "Criar conta"
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-400">
            {isRegister ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrors({});
              }}
              className="text-fuchsia-400 hover:underline font-medium"
            >
              {isRegister ? "Entrar" : "Crie sua conta"}
            </button>
          </p>

          {!isRegister && (
            <div className="mt-4 text-center text-xs text-zinc-500 bg-zinc-800/60 border border-zinc-700 rounded-md px-3 py-2">
              <p className="font-medium text-zinc-400">Acesso administrativo (teste)</p>
              <p className="mt-0.5">admin@amora.com / admimasterpassword</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;