import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Mail, Lock, User, UserPlus, Check } from "lucide-react";
import { useAuth } from "../../Shared/Contexts";

export function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Email inválido");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }


    setIsLoading(true);

    try {
      await register(formData.fullName, formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  relative overflow-hidden font-segoe flex items-center justify-center py-12">
      {/* Background animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(158,255,46,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,120,215,0.15)_0%,transparent_50%)]" />
        </div>
      </div>

      {/* Card de Registro */}
      <div className="relative z-10 w-full max-w-md mx-4">
        

        {/* Janela XP */}
        <div className="bg-white/95 rounded-t-lg shadow-xp-window overflow-hidden">
          {/* Title bar */}
          <div className="bg-gradient-to-b from-[#0997FF] to-[#0058B8] px-3 py-2 border-b border-[#003C8C]">
            <span className="text-white font-semibold text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Criar Conta
            </span>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="João da Silva"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
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
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                {/* Força da senha */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded ${formData.password.length >= 2 ? 'bg-red-500' : 'bg-gray-200'}`} />
                      <div className={`h-1 flex-1 rounded ${formData.password.length >= 6 ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                      <div className={`h-1 flex-1 rounded ${formData.password.length >= 10 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.password.length < 6 ? 'Senha fraca' : formData.password.length < 10 ? 'Senha média' : 'Senha forte'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              

              {/* Botão */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#003C8C] border-t-transparent rounded-full animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Criar Conta
                  </>
                )}
              </button>
            </form>

            {/* Link para login */}
            <div className="mt-6 text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}