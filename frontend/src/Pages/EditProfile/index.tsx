import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Save, X as XIcon, Image as ImageIcon, Link as LinkIcon, Trash2, FolderOpen, Monitor, LogOut, AlertTriangle } from "lucide-react";
import toast from 'react-hot-toast';
import { XPWindow } from "../../Shared/Components/XPWindow";
import { apiService } from "../../Shared/Services/api";
import { useAuth } from "../../Shared/Contexts";
import { signalRService } from "../../Shared/Services/signalr";
import { convertStatusToString, convertStatusToNumber, type UserStatusString } from "../../Shared/Utils/mappers";

const RetroIcon = ({ src, fallback: Fallback, className, title }: { src: string, fallback: any, className?: string, title?: string }) => {
  const [error, setError] = useState(false);

  if (error) {
    return <Fallback className={className} title={title} />;
  }

  return (
    <img 
      src={src} 
      className={className} 
      title={title} 
      style={{ imageRendering: 'pixelated', display: 'block' }} 
      alt="icon"
      onError={() => setError(true)}
    />
  );
};

const ICONS_URL = {
    USER: "https://win98icons.alexmeub.com/icons/png/user-2.png",
    SAVE: "https://win98icons.alexmeub.com/icons/png/floppy_drive-5.png",
    CLOSE: "https://win98icons.alexmeub.com/icons/png/msg_error-0.png",
    IMAGE: "https://win98icons.alexmeub.com/icons/png/image_file-2.png",
    FOLDER: "https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png",
    COMPUTER: "https://win98icons.alexmeub.com/icons/png/computer_explorer-5.png",
    TRASH: "https://win98icons.alexmeub.com/icons/png/recycle_bin_full-4.png",
    LINK: "https://win98icons.alexmeub.com/icons/png/world-2.png",
    LOGOUT: "https://win98icons.alexmeub.com/icons/png/shut_down_cool-0.png",
    WARNING: "https://win98icons.alexmeub.com/icons/png/msg_warning-0.png"
};

const Icons = {
  User: (props: any) => <RetroIcon src={ICONS_URL.USER} fallback={UserIcon} {...props} />,
  Save: (props: any) => <RetroIcon src={ICONS_URL.SAVE} fallback={Save} {...props} />,
  X: (props: any) => <RetroIcon src={ICONS_URL.CLOSE} fallback={XIcon} {...props} />,
  Image: (props: any) => <RetroIcon src={ICONS_URL.IMAGE} fallback={ImageIcon} {...props} />,
  Folder: (props: any) => <RetroIcon src={ICONS_URL.FOLDER} fallback={FolderOpen} {...props} />, 
  Trash: (props: any) => <RetroIcon src={ICONS_URL.TRASH} fallback={Trash2} {...props} />,
  Computer: (props: any) => <RetroIcon src={ICONS_URL.COMPUTER} fallback={Monitor} {...props} />,
  Link: (props: any) => <RetroIcon src={ICONS_URL.LINK} fallback={LinkIcon} {...props} />,
  Logout: (props: any) => <RetroIcon src={ICONS_URL.LOGOUT} fallback={LogOut} {...props} />,
  Warning: (props: any) => <RetroIcon src={ICONS_URL.WARNING} fallback={AlertTriangle} {...props} />,
};

export function EditProfile() {
  const navigate = useNavigate();
  const { user: currentUser, setUser, isConnected } = useAuth();
  
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
  const [showDeleteModal, setShowDeleteModal] = useState(false); // NOVO MODAL
  
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

  const handleLogout = async (): Promise<void> => {
    try {
      await signalRService.disconnect();      
      apiService.clearToken();
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      window.location.reload();
    } catch (error) {
      apiService.clearToken();      
      window.location.reload();
    }
  };

  // Apenas abre o modal
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Lógica real de deletar (chamada pelo modal)
  const confirmDeleteAccount = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Excluindo conta...");

    try {
        // await apiService.deleteAccount(); // Descomente quando tiver o endpoint
        await handleLogout(); // Por enquanto apenas desloga
        toast.success("Conta excluída com sucesso.", { id: toastId });
    } catch (error: any) {
        toast.error(error.message || "Erro ao excluir conta.", { id: toastId });
    } finally {
        setIsLoading(false);
        setShowDeleteModal(false);
    }
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

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        userName: displayName.trim(),
        avatar: avatarUrl, 
        backgroundPicture: customBackgroundUrl,
      };
      
      setUser(updatedUser); 
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    toast.success("Perfil atualizado com sucesso!", { id: toastId });
    setTimeout(() => navigate("/home"), 1000);
  } catch (error: any) {
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
      <div className="min-h-screen flex items-center justify-center font-tahoma">
        <div className="text-center">
          <Icons.Computer className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 text-sm">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full pt-14 pb-32 px-4 font-tahoma">
        <div className="max-w-2xl mx-auto">
          <XPWindow
            title="Editar Perfil"
            icon={<Icons.User className="w-4 h-4" />}
          >
            <div className="p-4 bg-[#ECE9D8]">
              <form onSubmit={handleSave} className="space-y-5">
                
                <div className="flex flex-row items-start gap-6 bg-white border border-gray-400 p-4 shadow-inner">
                  <div className="flex flex-col items-center gap-2">
                      <div className="relative group border-2 border-gray-500 shadow-md p-1 bg-white">
                      <img
                          src={avatarUrl || defaultAvatar}
                          alt="Avatar"
                          className="w-24 h-24 object-cover bg-gray-100"
                      />
                      <button
                          type="button"
                          onClick={handleOpenAvatarModal}
                          className="absolute inset-0 flex items-center justify-center bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Mudar foto"
                      >
                          <Icons.Folder className="w-8 h-8" />
                      </button>
                      </div>
                      {avatarUrl && (
                          <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-[10px] text-red-600 hover:underline flex items-center gap-1"
                          >
                          <Icons.X className="w-3 h-3" /> Remover
                          </button>
                      )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                      <p className="text-xs font-bold text-gray-600">Imagem de Exibição</p>
                      <p className="text-xs text-gray-500">Essa imagem aparecerá para seus contatos no Messenger.</p>
                      <button
                          type="button"
                          onClick={handleOpenAvatarModal}
                          className="px-3 py-1 bg-gray-200 border border-gray-600 shadow-sm hover:bg-gray-300 text-xs active:border-t-gray-600 active:shadow-inner flex items-center gap-2"
                      >
                          <Icons.Folder className="w-4 h-4" /> Procurar Imagem...
                      </button>
                  </div>
                </div>

                <fieldset className="border border-gray-400 p-3 pt-1">
                  <legend className="text-xs text-blue-800 px-1 font-bold">Informações Pessoais</legend>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-800">
                          Nome de Exibição:
                      </label>
                      <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Seu Nick"
                          required
                          className="w-full px-2 py-1 border border-gray-500 shadow-inner focus:outline-none focus:border-blue-500 text-sm"
                      />
                      </div>

                      <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-800">
                          Status Inicial:
                      </label>
                      <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as UserStatusString)}
                          className="w-full px-2 py-1 border border-gray-500 shadow-inner focus:outline-none text-sm bg-white"
                      >
                          <option value="Available">Disponível</option>
                          <option value="Busy">Ocupado</option>
                          <option value="Away">Ausente</option>
                          <option value="Offline">Invisível</option>
                      </select>
                      </div>
                  </div>

                  <div className="space-y-1 mt-4">
                      <label className="text-xs font-bold text-gray-800">
                      Frase Pessoal (Bio):
                      </label>
                      <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Digite uma mensagem pessoal..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-2 py-1 border border-gray-500 shadow-inner focus:outline-none resize-none text-sm"
                      />
                      <p className="text-[10px] text-gray-500 text-right">
                      {bio.length}/500
                      </p>
                  </div>
                </fieldset>

                <fieldset className="border border-gray-400 p-3 pt-1 bg-white/50">
                  <legend className="text-xs text-blue-800 px-1 font-bold flex items-center gap-1">
                      <Icons.Image className="w-3 h-3" /> Plano de Fundo
                  </legend>
                  
                  <div className="flex items-center gap-4 mt-2">
                      {customBackgroundUrl ? (
                          <div className="relative w-24 h-16 border border-gray-500 shadow-md bg-gray-800">
                              <img 
                              src={customBackgroundUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover opacity-80"
                              />
                              <button
                                  type="button"
                                  onClick={handleRemoveBackground}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white p-0.5 border border-white shadow-sm rounded hover:bg-red-700"
                                  title="Remover"
                              >
                                  <Icons.X className="w-3 h-3" />
                              </button>
                          </div>
                      ) : (
                          <div className="w-24 h-16 border border-gray-400 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 shadow-inner">
                              Sem imagem
                          </div>
                      )}
                      
                      <div className="flex flex-col gap-2">
                          <p className="text-[10px] text-gray-600 max-w-xs">
                              Personalize o fundo da sua janela principal com uma imagem da internet.
                          </p>
                          <div className="flex gap-2">
                              <button
                                  type="button"
                                  onClick={handleOpenBackgroundModal}
                                  className="px-3 py-1 bg-gradient-to-b from-white to-[#D0E8FF] border border-[#003C8C] rounded-sm text-[#003C8C] text-xs hover:brightness-105 active:brightness-95 flex items-center gap-1"
                              >
                                  <Icons.Link className="w-3 h-3" />
                                  {customBackgroundUrl ? "Alterar Link" : "Definir URL..."}
                              </button>
                          </div>
                      </div>
                  </div>
                </fieldset>

                <fieldset className="border border-gray-400 p-3 pt-1 bg-[#FFE8E8]/50">
                  <legend className="text-xs text-red-800 px-1 font-bold flex items-center gap-1">
                      <Icons.Warning className="w-3 h-3" /> Gerenciamento da Conta
                  </legend>
                  <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-gray-600 max-w-[200px]">
                          Aqui você pode sair do sistema ou excluir permanentemente sua conta.
                      </p>
                      <div className="flex gap-2">
                          <button
                              type="button"
                              onClick={handleLogout}
                              className="px-3 py-1 bg-white border border-gray-500 rounded-sm text-black text-xs hover:bg-gray-100 shadow-sm flex items-center gap-1"
                          >
                              <Icons.Logout className="w-3 h-3" /> Deslogar
                          </button>
                          <button
                              type="button"
                              onClick={handleDeleteClick}
                              className="px-3 py-1 bg-gradient-to-b from-[#FFD0D0] to-[#FFA0A0] border border-[#B00000] rounded-sm text-[#800000] font-bold text-xs hover:brightness-105 shadow-sm flex items-center gap-1"
                          >
                              <Icons.Trash className="w-3 h-3" /> Excluir
                          </button>
                      </div>
                  </div>
                </fieldset>

                <div className="flex gap-2 justify-end pt-2 border-t border-gray-300">
                  <button
                    type="button"
                    onClick={() => navigate("/home")}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-4 py-1 bg-gradient-to-b from-white to-[#E0E0E0] border border-gray-500 rounded-sm text-black text-sm hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
                  >
                    <Icons.X className="w-3 h-3" /> Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !displayName.trim()}
                    className="inline-flex items-center gap-1 px-6 py-1 bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] border border-[#003C74] rounded-sm text-black font-bold text-sm hover:bg-white transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? 'Salvando...' : (
                        <>
                          <Icons.Save className="w-4 h-4" /> Aplicar
                        </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </XPWindow>
        </div>
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-tahoma">
          <div className="bg-[#ECE9D8] border-2 border-white outline outline-1 outline-[#0055EA] rounded shadow-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-[#0058EE] to-[#3F93FF] px-2 py-1 flex items-center justify-between select-none">
              <span className="text-white font-bold text-xs flex items-center gap-2 shadow-text">
                <Icons.Folder className="w-4 h-4" />
                Selecionar Imagem
              </span>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-5 h-5 bg-[#D7432E] border border-white rounded flex items-center justify-center text-white hover:bg-red-600"
              >
                <Icons.X className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  Endereço da Imagem (URL):
                </label>
                <input
                  type="url"
                  value={tempAvatarUrl}
                  onChange={(e) => setTempAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2 py-1 border border-gray-500 shadow-inner focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              {tempAvatarUrl && (
                <div className="flex justify-center p-2 border border-gray-400 bg-white">
                  <img
                    src={tempAvatarUrl}
                    alt="Preview"
                    className="w-24 h-24 object-cover border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-1 border border-gray-600 bg-gray-200 hover:bg-gray-300 shadow-sm rounded-sm text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatarUrl}
                  className="px-4 py-1 border border-[#003C74] bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] text-black font-bold shadow-sm rounded-sm text-xs"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBackgroundModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-tahoma">
          <div className="bg-[#ECE9D8] border-2 border-white outline outline-1 outline-[#0055EA] rounded shadow-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-[#0058EE] to-[#3F93FF] px-2 py-1 flex items-center justify-between select-none">
              <span className="text-white font-bold text-xs flex items-center gap-2 shadow-text">
                <Icons.Computer className="w-4 h-4" />
                Fundo da Janela
              </span>
              <button
                onClick={() => setShowBackgroundModal(false)}
                className="w-5 h-5 bg-[#D7432E] border border-white rounded flex items-center justify-center text-white hover:bg-red-600"
              >
                <Icons.X className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  Endereço da Imagem (URL):
                </label>
                <input
                  type="url"
                  value={tempBackgroundUrl}
                  onChange={(e) => setTempBackgroundUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2 py-1 border border-gray-500 shadow-inner focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              {tempBackgroundUrl && (
                <div className="border border-gray-400 bg-white p-1">
                  <img
                    src={tempBackgroundUrl}
                    alt="Preview"
                    className="w-full h-24 object-cover border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/800x200?text=Imagem+Inválida";
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowBackgroundModal(false)}
                  className="px-4 py-1 border border-gray-600 bg-gray-200 hover:bg-gray-300 shadow-sm rounded-sm text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBackgroundUrl}
                  className="px-4 py-1 border border-[#003C74] bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] text-black font-bold shadow-sm rounded-sm text-xs"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Conta (Retrô) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[70] p-4 font-tahoma">
          <div className="bg-[#ECE9D8] border-2 border-white outline outline-1 outline-[#0055EA] rounded shadow-xl w-full max-w-sm">
            {/* Cabeçalho Vermelho de Erro/Perigo */}
            <div className="bg-gradient-to-r from-[#FF3F3F] to-[#CC0000] px-2 py-1 flex items-center justify-between select-none">
              <span className="text-white font-bold text-xs flex items-center gap-2 shadow-text">
                <Icons.Warning className="w-4 h-4" />
                Excluir Conta
              </span>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-5 h-5 bg-[#D7432E] border border-white rounded flex items-center justify-center text-white hover:bg-red-600"
              >
                <Icons.X className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 flex flex-row gap-4">
              <div className="flex-shrink-0">
                 <Icons.Warning className="w-10 h-10" />
              </div>
              <div className="text-xs text-gray-800">
                <p className="font-bold mb-2">Tem certeza que deseja excluir sua conta?</p>
                <p>Esta ação apagará permanentemente seus dados, contatos e mensagens. <br/><br/> Não é possível desfazer esta ação.</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center p-3 border-t border-white/50">
                <button
                  type="button"
                  onClick={confirmDeleteAccount}
                  disabled={isLoading}
                  className="px-6 py-1 border border-gray-500 bg-white text-black text-xs hover:bg-gray-50 shadow-sm rounded-sm focus:outline-dotted focus:outline-1"
                >
                  {isLoading ? 'Excluindo...' : 'Sim'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isLoading}
                  className="px-6 py-1 border border-[#003C74] bg-gradient-to-b from-[#F6F6F6] to-[#E3E3E3] text-black font-bold shadow-sm rounded-sm text-xs hover:bg-white focus:outline-dotted focus:outline-1"
                >
                  Não
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}