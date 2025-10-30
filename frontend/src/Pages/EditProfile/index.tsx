import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Save, X, Image, LinkIcon } from "lucide-react";
import toast from 'react-hot-toast';
import { XPWindow } from "../../Shared/Components/XPWindow";
import { apiService } from "../../Shared/Services/api";
import { useAuth } from "../../Shared/Contexts";
import { convertStatusToString, convertStatusToNumber, type UserStatusString } from "../../Shared/Utils/mappers";

export function EditProfile() {
  const navigate = useNavigate();
  const { user: currentUser, setUser  } = useAuth();
  
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<UserStatusString>("Available");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Estados dos modais
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState("");
  const [tempBackgroundUrl, setTempBackgroundUrl] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const userData = await apiService.getCurrentUser();
      
      setDisplayName(userData.userName || (userData as any).username || "");
      setStatus(convertStatusToString(userData.status));
      setBio(userData.description || "");
      setAvatarUrl(userData.profilePicture || "");
      setCustomBackgroundUrl(userData.backgroundPicture || "");
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar perfil. Tente novamente.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenAvatarModal = () => {
    setTempAvatarUrl(avatarUrl);
    setShowAvatarModal(true);
  };

  const handleSaveAvatarUrl = () => {
    setAvatarUrl(tempAvatarUrl);
    setShowAvatarModal(false);
    setTempAvatarUrl("");
    toast.success("Imagem de perfil atualizada!");
  };

  const handleOpenBackgroundModal = () => {
    setTempBackgroundUrl(customBackgroundUrl);
    setShowBackgroundModal(true);
  };

  const handleSaveBackgroundUrl = () => {
    setCustomBackgroundUrl(tempBackgroundUrl);
    setShowBackgroundModal(false);
    setTempBackgroundUrl("");
    toast.success("Imagem de fundo atualizada!");
  };

  const handleRemoveBackground = () => {
    setCustomBackgroundUrl("");
    toast.success("Imagem de fundo removida!");
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    toast.success("Imagem de perfil removida!");
  };

  const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!displayName.trim()) {
    toast.error("Por favor, preencha o nome de exibição");
    return;
  }

  setIsLoading(true);
  const toastId = toast.loading("Salvando perfil...");
  
  try {
    const userDto = {
      username: displayName.trim(),
      profilePicture: avatarUrl,
      backgroundPicture: customBackgroundUrl,
      description: bio.trim(),
      status: convertStatusToNumber(status)
    };
    
    await apiService.updateUserProfile(userDto);

    // ✅ CORREÇÃO AQUI:
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        userName: displayName.trim(),
        avatar: avatarUrl, // profilePicture vira avatar
      };
      
      setUser(updatedUser); // Passa o objeto, não a string!
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    toast.success("Perfil atualizado com sucesso!", { id: toastId });
    setTimeout(() => navigate("/home"), 1000);
  } catch (error: any) {
    console.error("❌ Erro ao salvar perfil:", error);
    toast.error(error.message || "Erro ao salvar perfil. Tente novamente.", { id: toastId });
  } finally {
    setIsLoading(false);
  }
};

  const defaultAvatar = currentUser?.email 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
                    className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                    style={{
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(0, 120, 215, 0.3)"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleOpenAvatarModal}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LinkIcon className="w-8 h-8 text-white" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleOpenAvatarModal}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Alterar imagem
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              {/* Nome e Status */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Nome de Exibição *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Como você quer ser chamado"
                    required
                    className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatusString)}
                    className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors"
                  >
                    <option value="Available">Disponível</option>
                    <option value="Busy">Ocupado</option>
                    <option value="Away">Ausente</option>
                    <option value="Offline">Offline</option>
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
                  maxLength={500}
                  className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 text-right">
                  {bio.length}/500 caracteres
                </p>
              </div>

              {/* Background Personalizado */}
              <div className="space-y-3 p-4 bg-white/85 backdrop-blur-md border border-white/50 rounded-lg shadow-glass">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Image className="w-4 h-4 text-blue-600" />
                  Fundo Personalizado
                </label>
                <p className="text-xs text-gray-500">
                  Cole o link de uma imagem para usar como fundo do app.
                </p>
                
                {customBackgroundUrl && (
                  <div className="relative rounded-lg overflow-hidden border-2 border-blue-300">
                    <img 
                      src={customBackgroundUrl} 
                      alt="Background preview" 
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/800x200?text=Imagem+Inválida";
                      }}
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
                  <button
                    type="button"
                    onClick={handleOpenBackgroundModal}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] transition-all"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {customBackgroundUrl ? "Alterar Link" : "Adicionar Link"}
                  </button>
                  {customBackgroundUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      className="px-4 py-2 bg-gradient-to-b from-white to-[#FFE0E0] border border-red-500 rounded text-red-700 font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#FFD0D0] transition-all"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-400 rounded text-gray-700 font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#D0D0D0] transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !displayName.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#003C8C] border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Perfil
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </XPWindow>
      </div>

      {/* Modal do Avatar */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-b from-[#0997FF] to-[#0058B8] px-4 py-3 rounded-t-lg flex items-center justify-between">
              <span className="text-white font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Imagem de Perfil
              </span>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Cole o link da imagem:
                </label>
                <input
                  type="url"
                  value={tempAvatarUrl}
                  onChange={(e) => setTempAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {tempAvatarUrl && (
                <div className="flex justify-center">
                  <img
                    src={tempAvatarUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded-full border-4 border-blue-300 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-400 rounded text-gray-700 font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#D0D0D0] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatarUrl}
                  className="flex-1 px-4 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] transition-all"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Background */}
      {showBackgroundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-b from-[#0997FF] to-[#0058B8] px-4 py-3 rounded-t-lg flex items-center justify-between">
              <span className="text-white font-semibold flex items-center gap-2">
                <Image className="w-4 h-4" />
                Imagem de Fundo
              </span>
              <button
                onClick={() => setShowBackgroundModal(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Cole o link da imagem:
                </label>
                <input
                  type="url"
                  value={tempBackgroundUrl}
                  onChange={(e) => setTempBackgroundUrl(e.target.value)}
                  placeholder="https://exemplo.com/fundo.jpg"
                  className="w-full px-4 py-2 border-2 border-blue-300 focus:border-blue-500 rounded-lg focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {tempBackgroundUrl && (
                <div className="rounded-lg overflow-hidden border-2 border-blue-300">
                  <img
                    src={tempBackgroundUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/800x200?text=Imagem+Inválida";
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBackgroundModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-400 rounded text-gray-700 font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#D0D0D0] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBackgroundUrl}
                  className="flex-1 px-4 py-2 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded text-[#003C8C] font-semibold text-sm shadow-xp-button hover:from-white hover:to-[#B8DAFF] transition-all"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}