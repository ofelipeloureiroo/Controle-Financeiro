import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Trash2, X, Settings, Image as ImageIcon, Save, AlertTriangle, LogOut, Shield, Palette, Briefcase, Sparkles, RefreshCw } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { NicheType, ThemeColorId } from '../../types';
import { NICHES, THEMES } from '../../utils/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    architectProfile,
    updateArchitectProfile,
    updateProfilePhoto,
    changeTheme,
    changeNiche,
    exportDataJSON,
    importDataJSON,
    loadDemoData,
    resetAllData,
  } = useFinance();

  const { profile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(architectProfile.name || '');
  const [title, setTitle] = useState(architectProfile.title || '');
  const [photoUrl, setPhotoUrl] = useState(architectProfile.photoUrl || '');
  const [selectedNiche, setSelectedNiche] = useState<NicheType>(architectProfile.niche || 'arquitetura');
  const [selectedTheme, setSelectedTheme] = useState<ThemeColorId>(architectProfile.themeColor || 'gold');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(architectProfile.name || '');
      setTitle(architectProfile.title || '');
      setPhotoUrl(architectProfile.photoUrl || '');
      setSelectedNiche(architectProfile.niche || 'arquitetura');
      setSelectedTheme(architectProfile.themeColor || 'gold');
      setShowResetConfirm(false);
      setShowDemoConfirm(false);
    }
  }, [isOpen, architectProfile]);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    updateArchitectProfile({ name, title, niche: selectedNiche, themeColor: selectedTheme });
    updateProfilePhoto(photoUrl);
    changeTheme(selectedTheme);
    changeNiche(selectedNiche);
    onClose();
  };

  const handleSelectThemeQuick = (t: ThemeColorId) => {
    setSelectedTheme(t);
    changeTheme(t);
  };

  const handleSelectNicheQuick = (n: NicheType) => {
    setSelectedNiche(n);
    changeNiche(n);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        if (importDataJSON(content)) {
          alert('Dados carregados com sucesso!');
          onClose();
        } else {
          alert('Erro ao carregar dados. O arquivo JSON pode estar corrompido ou ser inválido.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    if (showResetConfirm) {
      resetAllData();
      setShowResetConfirm(false);
      onClose();
    } else {
      setShowResetConfirm(true);
    }
  };

  const handleLoadDemo = () => {
    if (showDemoConfirm) {
      loadDemoData();
      setShowDemoConfirm(false);
      onClose();
    } else {
      setShowDemoConfirm(true);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#1c1815] border border-[#3d342f] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#3d342f]">
          <div className="flex items-center gap-2 text-[#fcf8f5]">
            <Settings className="w-5 h-5 text-[var(--theme-primary)]" />
            <h2 className="text-lg font-bold font-serif">Configurações do Escritório</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#3d342f] text-[#a89c93] hover:text-[#fcf8f5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Theme & Niche Customization Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--theme-primary)] uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4" /> Personalização Visual & Nicho
            </h3>

            {/* Nicho Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#a89c93] mb-1.5">
                Nicho / Atuação Profissional
              </label>
              <select
                value={selectedNiche}
                onChange={(e) => handleSelectNicheQuick(e.target.value as NicheType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#3d342f] text-[#fcf8f5] text-xs font-semibold focus:outline-none focus:border-[var(--theme-primary)]"
              >
                {(Object.keys(NICHES) as NicheType[]).map((nk) => (
                  <option key={nk} value={nk}>
                    {NICHES[nk].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Palettes Swatches */}
            <div>
              <label className="block text-xs font-semibold text-[#a89c93] mb-2">
                Cor Principal do Painel
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(THEMES) as ThemeColorId[]).map((tk) => {
                  const th = THEMES[tk];
                  const isSelected = selectedTheme === tk;
                  return (
                    <button
                      key={tk}
                      type="button"
                      onClick={() => handleSelectThemeQuick(tk)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#28221e] border-white/40 ring-1 ring-[var(--theme-primary)]'
                          : 'bg-[#09090b] border-[#3d342f] hover:border-[#52443c]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: th.primary }}
                      />
                      <span className="text-[11px] font-bold text-[#fcf8f5] truncate">
                        {th.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Access & Security */}
          <section className="space-y-3 pt-3 border-t border-[#2d2621]">
            <h3 className="text-sm font-bold text-[var(--theme-primary)] uppercase tracking-wider">Acesso e Conta</h3>
            <div className="bg-[#09090b] border border-[#3d342f] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#fcf8f5] font-bold">{profile?.email || 'Usuário Local'}</div>
                  <div className="text-xs text-[#a89c93] mt-0.5 capitalize">{profile?.role === 'admin' ? 'Administrador do Sistema' : 'Assinante / Profissional'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#241e1b] hover:bg-red-500/20 text-[#a89c93] hover:text-red-400 border border-[#3d342f] hover:border-red-500/30 text-xs font-bold rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
              
              {profile?.role === 'admin' && (
                <button
                  onClick={() => {
                    onClose();
                    navigate('/admin');
                  }}
                  className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 bg-[var(--theme-primary)] text-black rounded-xl font-bold transition-colors text-sm"
                >
                  <Shield className="w-4 h-4" />
                  Gerenciar Usuários (Painel Admin)
                </button>
              )}
            </div>
          </section>

          {/* Profile Section */}
          <section className="space-y-3 pt-3 border-t border-[#2d2621]">
            <h3 className="text-sm font-bold text-[var(--theme-primary)] uppercase tracking-wider">Dados do Profissional</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-[#a89c93] mb-1 text-xs font-medium">Nome / Empresa</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-[#3d342f] text-[#fcf8f5] text-xs focus:outline-none focus:border-[var(--theme-primary)]"
                  placeholder="Ex: Studio Alvorada"
                />
              </div>

              <div>
                <label className="block text-[#a89c93] mb-1 text-xs font-medium">Título Profissional</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-[#3d342f] text-[#fcf8f5] text-xs focus:outline-none focus:border-[var(--theme-primary)]"
                  placeholder="Ex: Consultoria & Projetos"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--theme-primary)] text-black rounded-xl font-bold transition-colors text-xs shadow-md"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </section>

          {/* Backup Section */}
          <section className="space-y-3 pt-3 border-t border-[#2d2621]">
            <h3 className="text-sm font-bold text-[var(--theme-primary)] uppercase tracking-wider">Backup e Restauração</h3>
            <p className="text-xs text-[#a89c93]">
              Exporte seus dados em JSON para criar um backup seguro de todos os projetos, caixas e clientes.
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => exportDataJSON()}
                className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] hover:bg-[#151210] border border-[#3d342f] hover:border-[var(--theme-primary)]/50 transition-colors text-left"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#fcf8f5]">Baixar Backup (Exportar JSON)</h4>
                  <p className="text-[11px] text-[#a89c93]">Salva todos os projetos e finanças num arquivo.</p>
                </div>
                <Download className="w-4 h-4 text-[var(--theme-primary)]" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] hover:bg-[#151210] border border-[#3d342f] hover:border-blue-500/50 transition-colors text-left"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#fcf8f5]">Carregar Backup (Importar JSON)</h4>
                  <p className="text-[11px] text-[#a89c93]">Restaura dados salvos anteriormente.</p>
                </div>
                <Upload className="w-4 h-4 text-blue-400" />
              </button>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </section>

          {/* Demo Data & Reset Clean Office */}
          <section className="space-y-3 pt-3 border-t border-[#2d2621]">
            <h3 className="text-sm font-bold text-[#a89c93] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" /> Dados de Teste & Limpeza
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleLoadDemo}
                className="flex items-center justify-between p-3 rounded-xl bg-[#201a17] hover:bg-[#28221e] border border-[#3d342f] text-left transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#fcf8f5]">
                    {showDemoConfirm ? '⚠️ Confirmar carregar dados de demonstração?' : 'Carregar Dados de Exemplo (Demonstração)'}
                  </h4>
                  <p className="text-[11px] text-[#a89c93]">
                    Preenche o escritório com projetos e fluxo de caixa ilustrativos para teste.
                  </p>
                </div>
                <RefreshCw className="w-4 h-4 text-[var(--theme-primary)]" />
              </button>

              <button
                onClick={handleResetData}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition-all border text-left ${
                  showResetConfirm 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-600 animate-pulse' 
                    : 'bg-[#09090b] text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">
                    {showResetConfirm ? '⚠️ TEM CERTEZA? APAGAR TUDO (CLIQUE NOVAMENTE)' : 'Zerar Todo o Escritório (Começar do Zero)'}
                  </h4>
                  <p className="text-[11px] text-[#a89c93] font-normal">
                    Limpa todos os projetos e transações para iniciar com o escritório totalmente vazio.
                  </p>
                </div>
                <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
