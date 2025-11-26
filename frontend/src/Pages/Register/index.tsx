import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "../../Shared/Contexts";

const RetroIcon = ({ src, fallback: Fallback, className }: { src: string; fallback: any; className?: string }) => {
  const [error, setError] = useState(false);
  if (error) return <Fallback className={className} />;
  return <img src={src} className={className} style={{ imageRendering: "pixelated" }} onError={() => setError(true)} alt="" />;
};

const ICONS = {
  USER: "https://win98icons.alexmeub.com/icons/png/user-2.png",
  MAIL: "https://win98icons.alexmeub.com/icons/png/mail-2.png",
  LOCK: "https://win98icons.alexmeub.com/icons/png/lock-0.png",
};

export function Register() {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { name, email, password } = formData;

    if (!name || !email || !password ) {
      setError("Preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Email inválido");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#008080] flex items-center justify-center pt-20 p-4 font-tahoma">
      
      <div className="absolute inset-0 opacity-30"
        style={{ background: "url(https://win98icons.alexmeub.com/images/windows-xp-bliss.jpg) center/cover" }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-[#ECE9D8] border-2 border-white outline outline-1 outline-[#0055EA] rounded shadow-xl">

          <div className="bg-gradient-to-r from-[#0058EE] to-[#3F93FF] px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icons/logo.png" className="w-5 h-5" style={{ imageRendering: "pixelated" }} />
              <span className="text-white font-bold text-sm">Criar conta</span>
            </div>
          </div>

          <div className="p-6 space-y-6">

            <div className="text-center">
              <img src="/icons/logo.png" className="w-16 h-16 mx-auto mb-4" style={{ imageRendering: "pixelated" }} />
              <h1 className="text-xl font-bold text-[#003399]">Criar conta</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nome */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <RetroIcon src={ICONS.USER} fallback={User} className="w-4 h-4" />
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2 border border-gray-500 shadow-inner focus:outline-none focus:border-[#0055EA] text-sm bg-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <RetroIcon src={ICONS.MAIL} fallback={Mail} className="w-4 h-4" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 border border-gray-500 shadow-inner focus:outline-none text-sm bg-white"
                />
              </div>

              {/* Senha */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <RetroIcon src={ICONS.LOCK} fallback={Lock} className="w-4 h-4" />
                  Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 border border-gray-500 shadow-inner focus:outline-none text-sm bg-white"
                />
              </div>
              {/* Erro */}
              {error && (
                <div className="bg-[#FFD4D4] border border-[#FF8C8C] text-[#D80000] px-4 py-3 rounded text-xs">
                  {error}
                </div>
              )}

              {/* Botão */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] border border-[#003C74] rounded-sm font-bold text-black shadow-sm hover:bg-white disabled:opacity-60"
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-400 text-center">
              <p className="text-xs text-gray-700">
                Já tem conta?{" "}
                <Link to="/login" className="text-[#003399] font-bold hover:underline">
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
