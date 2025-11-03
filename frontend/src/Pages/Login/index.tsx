import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../Shared/Contexts";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Email inválido");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-segoe flex items-center justify-center">
      {/* Background animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(158,255,46,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,120,215,0.15)_0%,transparent_50%)]" />
        </div>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md mx-4">
        

        {/* Janela XP */}
        <div className="bg-white/95 rounded-t-lg shadow-xp-window overflow-hidden">
          {/* Title bar */}
          <div className="bg-gradient-to-b from-[#0997FF] to-[#0058B8] px-3 py-2 border-b border-[#003C8C]">
            <span className="text-white font-semibold text-sm flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Fazer Login
            </span>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Lembrar-me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                    Lembrar-me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:underline font-medium">
                  Esqueceu a senha?
                </a>
              </div>

              {/* Botão */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#003C8C] border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            {/* Link para registro */}
            <div className="mt-6 text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link to="/registro" className="text-blue-600 font-semibold hover:underline">
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}