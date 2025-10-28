import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, Save, X, Image } from "lucide-react";
import { XPWindow } from "../../Shared/Components/XPWindow";

type Status = "available" | "busy" | "away" | "offline";

export function EditProfile() {
  const navigate = useNavigate();
  
  // Dados mockados do usuário
  const [displayName, setDisplayName] = useState("João Silva");
  const [status, setStatus] = useState<Status>("available");
  const [bio, setBio] = useState("Desenvolvedor apaixonado por tecnologia");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    
    // Simular upload
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setAvatarUrl(reader.result as string);
        setUploadingAvatar(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBackground(true);
    
    // Simular upload
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setCustomBackgroundUrl(reader.result as string);
        setUploadingBackground(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = () => {
    setCustomBackgroundUrl("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular salvamento
    setTimeout(() => {
      const userData = {
        displayName,
        status,
        bio,
        avatarUrl,
        customBackgroundUrl
      };
      localStorage.setItem("userProfile", JSON.stringify(userData));
      console.log("Perfil salvo:", userData);
      setIsLoading(false);
      navigate("/chat");
    }, 1000);
  };

  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=joao@email.com";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5EAEFF] via-[#B7E3FF] to-white relative overflow-hidden font-segoe">
      {/* Background animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(158,255,46,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,120,215,0.15)_0%,transparent_50%)]" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <XPWindow
            title="Editar Perfil"
            icon={<User className="w-4 h-4 text-white" />}
          >
            <div className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <img
                      src={avatarUrl || defaultAvatar}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-2xl"
                      style={{
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(0, 120, 215, 0.3)"
                      }}
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  {uploadingAvatar && (
                    <p className="text-sm text-blue-600 mt-2">Fazendo upload do avatar...</p>
                  )}
                </div>

                {/* Nome e Status */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Nome de Exibição
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Como você quer ser chamado"
                      className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Status)}
                      className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors"
                    >
                      <option value="available">Disponível</option>
                      <option value="busy">Ocupado</option>
                      <option value="away">Ausente</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Descrição / Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Compartilhe algo sobre você..."
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Background Personalizado */}
                <div className="space-y-3 p-4 bg-white/85 backdrop-blur-md border border-white/50 rounded-lg shadow-glass">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-600" />
                    Fundo Personalizado
                  </label>
                  <p className="text-xs text-gray-500">
                    Escolha uma imagem para usar como fundo do app. Se não escolher, o gradiente padrão será usado.
                  </p>
                  
                  {customBackgroundUrl && (
                    <div className="relative rounded-lg overflow-hidden border-2 border-blue-300">
                      <img 
                        src={customBackgroundUrl} 
                        alt="Background preview" 
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBackground}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                        disabled={uploadingBackground}
                      />
                      <div className="w-full text-center cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150">
                        <Image className="w-4 h-4" />
                        {uploadingBackground ? "Fazendo upload..." : "Escolher Imagem"}
                      </div>
                    </label>
                    {customBackgroundUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveBackground}
                        className="px-4 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150"
                      >
                        Usar Padrão
                      </button>
                    )}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-400 rounded text-gray-700 font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#D0D0D0] hover:shadow-xp-button-hover active:from-[#D0D0D0] active:to-white active:shadow-xp-button-active transition-all duration-150"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? "Salvando..." : "Salvar Perfil"}
                  </button>
                </div>
              </form>
            </div>
          </XPWindow>
        </div>
      </div>
    </div>
  );
}