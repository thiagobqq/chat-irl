import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../../Shared/Contexts";
import toast from "react-hot-toast";

const RetroIcon = ({ src, fallback: Fallback, className }: { src: string; fallback: any; className?: string }) => {
  const [error, setError] = useState(false);
  if (error) return <Fallback className={className} />;
  return <img src={src} className={className} style={{ imageRendering: "pixelated" }} onError={() => setError(true)} alt="" />;
};

const ICONS = {
  MSN: "https://win98icons.alexmeub.com/icons/png/msn_messenger-0.png",
  MAIL: "https://win98icons.alexmeub.com/icons/png/mail-2.png",
  LOCK: "https://win98icons.alexmeub.com/icons/png/lock-0.png",
};

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Preencha todos os campos");
    if (!email.includes("@")) return setError("Email inválido");

    setIsLoading(true);
    try {
      await login(email, password, false);
    } catch (err: any) {
      setError(err.message || "Usuário ou senha incorretos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#008080] flex items-center justify-center pt-20 p-4 font-tahoma">
      {/* Fundo Bliss sutil */}
      <div className="absolute inset-0 opacity-30" style={{ background: "url(https://win98icons.alexmeub.com/images/windows-xp-bliss.jpg) center/cover" }} />

      <div className="relative w-full max-w-md">
        <div className="bg-[#ECE9D8] border-2 border-white outline outline-1 outline-[#0055EA] rounded shadow-xl">
          {/* Title bar azul */}
          <div className="bg-gradient-to-r from-[#0058EE] to-[#3F93FF] px-3 py-1.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <img src="/icons/profile.png" alt="Login" className="w-5 h-5" style={{ imageRendering: "pixelated" }} />
              <span className="text-white font-bold text-sm">Entrar</span>
            </div>
            <div className="flex gap-1">
              <button className="w-5 h-5 bg-[#C0C0C0] border border-white flex items-center justify-center text-xs hover:bg-gray-300">_</button>
              <button className="w-5 h-5 bg-[#C0C0C0] border border-white flex items-center justify-center text-xs hover:bg-gray-300">□</button>
              <button className="w-5 h-5 bg-[#D7432E] border border-white flex items-center justify-center text-white text-xs hover:bg-red-600">×</button>
            </div>
          </div>

          {/* Corpo */}
          <div className="p-6 space-y-6">
            <div className="text-center">
              <img src="/icons/profile.png" alt="Profile" className="w-16 h-16 mx-auto mb-4" style={{ imageRendering: "pixelated" }} />
              <h1 className="text-xl font-bold text-[#003399]">Fazer login</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <RetroIcon src={ICONS.MAIL} fallback={Mail} className="w-4 h-4" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 border border-gray-500 shadow-inner focus:outline-none focus:border-[#0055EA] text-sm bg-white"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <RetroIcon src={ICONS.LOCK} fallback={Lock} className="w-4 h-4" />
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-500 shadow-inner focus:outline-none focus:border-[#0055EA] text-sm bg-white"
                />
              </div>

              {error && (
                <div className="bg-[#FFD4D4] border border-[#FF8C8C] text-[#D80000] px-4 py-3 rounded text-xs">
                  {error}
                </div>
              )}

             

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] border border-[#003C74] rounded-sm font-bold text-black shadow-sm hover:bg-white disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-gray-400 text-center">
              <p className="text-xs text-gray-700">
                Não tem uma conta?{" "}
                <Link to="/registro" className="text-[#003399] font-bold hover:underline">
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