import React, { useRef, useState } from 'react';
import {
  Briefcase,
  Camera,
  Check,
  Globe,
  Image as ImageIcon,
  Instagram,
  Layers,
  MapPin,
  Palette,
  QrCode,
  RefreshCw,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ArchitectProfile, NicheType, ThemeColorId } from '../../types';
import { NICHES, THEMES } from '../../utils/theme';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'preset-1',
    label: 'Clássico Executivo',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-2',
    label: 'Studio Criativo',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-3',
    label: 'Minimalista & Moderno',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-4',
    label: 'Luz Natural & Biofilia',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-5',
    label: 'Executivo & Campo',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-6',
    label: 'Tech & Engenharia',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { architectProfile, updateArchitectProfile, updateProfilePhoto, changeTheme, changeNiche } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'theme_niche' | 'photo' | 'info'>('theme_niche');
  const [formData, setFormData] = useState<ArchitectProfile>({ ...architectProfile });
  const [urlInput, setUrlInput] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(architectProfile.photoUrl);
  const [isDragOver, setIsDragOver] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviewPhoto(result);
        setFormData((prev) => ({ ...prev, photoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setPreviewPhoto(urlInput.trim());
      setFormData((prev) => ({ ...prev, photoUrl: urlInput.trim() }));
      setUrlInput('');
    }
  };

  const handleSelectPreset = (url: string) => {
    setPreviewPhoto(url);
    setFormData((prev) => ({ ...prev, photoUrl: url }));
  };

  const handleSelectNiche = (nicheId: NicheType) => {
    const nicheConf = NICHES[nicheId];
    setFormData((prev) => ({
      ...prev,
      niche: nicheId,
      title: prev.title === 'Arquitetura e Interiores' || !prev.title ? (nicheConf?.defaultTitle || prev.title) : prev.title,
      specialty: prev.specialty === 'Especialista em projetos residenciais e comerciais' || !prev.specialty ? (nicheConf?.defaultSpecialty || prev.specialty) : prev.specialty,
    }));
  };

  const handleSelectTheme = (themeId: ThemeColorId) => {
    setFormData((prev) => ({
      ...prev,
      themeColor: themeId,
    }));
    changeTheme(themeId);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateArchitectProfile(formData);
    if (previewPhoto) {
      updateProfilePhoto(previewPhoto);
    }
    if (formData.themeColor) {
      changeTheme(formData.themeColor);
    }
    if (formData.niche) {
      changeNiche(formData.niche);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-[#1a1614] border border-[#3d342f] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2d2621] bg-gradient-to-r from-[#241e1b] to-[#1a1614]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-accent)]/20 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-[#f5ede4]">
                Personalizar Escritório & Nicho
              </h2>
              <p className="text-xs text-[#a89a8f]">
                Ajuste seu nicho de atuação, esquema de cores, foto de perfil e dados de atendimento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#a89a8f] hover:text-[#f5ede4] hover:bg-[#2c241f] transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2d2621] bg-[#161311] px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('theme_niche')}
            className={`flex items-center gap-2 py-3.5 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'theme_niche'
                ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] font-bold'
                : 'border-transparent text-[#8a7c73] hover:text-[#e5ddd5]'
            }`}
          >
            <Palette className="w-4 h-4" />
            Nicho & Cores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-2 py-3.5 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'photo'
                ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] font-bold'
                : 'border-transparent text-[#8a7c73] hover:text-[#e5ddd5]'
            }`}
          >
            <Camera className="w-4 h-4" />
            Foto & Avatar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 py-3.5 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'info'
                ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] font-bold'
                : 'border-transparent text-[#8a7c73] hover:text-[#e5ddd5]'
            }`}
          >
            <User className="w-4 h-4" />
            Dados & Cobrança Pix
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: NICHO & CORES */}
          {activeTab === 'theme_niche' && (
            <div className="space-y-6">
              {/* Nicho Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#fcf8f5] flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[var(--theme-primary)]" />
                      Qual é o seu Nicho / Atuação?
                    </h3>
                    <p className="text-xs text-[#a89a8f]">
                      O escritório adapta categorias, nomenclaturas e status para sua profissão.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(Object.keys(NICHES) as NicheType[]).map((nicheKey) => {
                    const niche = NICHES[nicheKey];
                    const isSelected = (formData.niche || 'arquitetura') === nicheKey;

                    return (
                      <button
                        key={nicheKey}
                        type="button"
                        onClick={() => handleSelectNiche(nicheKey)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-[var(--theme-primary)]/15 border-[var(--theme-primary)] shadow-lg shadow-[var(--theme-primary)]/10 ring-1 ring-[var(--theme-primary)]'
                            : 'bg-[#201a17] border-[#342c27] hover:border-[#4d423b] text-[#a89a8f]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#fcf8f5]' : 'text-[#d6c7bc]'}`}>
                            {niche.label}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[var(--theme-primary)] text-black flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8a7c73] line-clamp-2">
                          {niche.defaultSpecialty}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme Colors Selection */}
              <div className="pt-4 border-t border-[#2d2621]">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-[#fcf8f5] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[var(--theme-primary)]" />
                    Esquema de Cores do Escritório
                  </h3>
                  <p className="text-xs text-[#a89a8f]">
                    Escolha a paleta de destaque visual para botões, bordas, badges e gráficos.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(THEMES) as ThemeColorId[]).map((themeKey) => {
                    const th = THEMES[themeKey];
                    const isSelected = (formData.themeColor || 'gold') === themeKey;

                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => handleSelectTheme(themeKey)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-[#28221e] border-white/40 ring-2 ring-[var(--theme-primary)] shadow-lg'
                            : 'bg-[#201a17] border-[#342c27] hover:border-[#4d423b]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full shadow-inner border border-white/20"
                              style={{ backgroundColor: th.primary }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-inner -ml-3 border border-white/20"
                              style={{ backgroundColor: th.accent }}
                            />
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--theme-primary)] text-black">
                              Ativo
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#fcf8f5]">{th.name}</p>
                          <p className="text-[10px] text-[#8a7c73] truncate">{th.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTO & AVATAR */}
          {activeTab === 'photo' && (
            <div className="space-y-6">
              {/* Photo Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[#201a17] border border-[#342c27]">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[var(--theme-accent)] via-[var(--theme-primary)] to-[var(--theme-accent)] shadow-2xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#14110f] border-2 border-[#1a1614]">
                      <img
                        src={previewPhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                        alt="Prévia da foto de perfil"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity backdrop-blur-xs cursor-pointer"
                  >
                    <Camera className="w-6 h-6 mb-1 text-[var(--theme-primary)]" />
                    <span className="text-[11px] font-medium">Trocar</span>
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h3 className="text-base font-medium text-[#f5ede4]">
                      {formData.name || 'Meu Escritório'}
                    </h3>
                    <p className="text-xs text-[#a89a8f]">
                      Recomendado: foto quadrada (1:1), JPG, PNG ou WebP com boa nitidez.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--theme-primary)] text-black font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Carregar do Computador / Celular
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultUrl =
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                        setPreviewPhoto(defaultUrl);
                        setFormData((prev) => ({ ...prev, photoUrl: defaultUrl }));
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2c241f] hover:bg-[#382f29] text-[#cfc2b8] text-xs transition-colors"
                      title="Restaurar foto padrão"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Restaurar Padrão
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10'
                    : 'border-[#3d342f] hover:border-[var(--theme-primary)]/50 bg-[#161311]/60'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-[#241e1b] text-[var(--theme-primary)]">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-[#f5ede4]">
                    Arraste e solte uma foto aqui ou clique para buscar
                  </p>
                  <p className="text-xs text-[#8a7c73]">
                    Formatos JPG, PNG, WebP (máx. 10MB)
                  </p>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#c4b5a8]">
                  Ou cole o link direto de uma imagem online:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    className="flex-1 bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[var(--theme-primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-[#2c241f] hover:bg-[#382f29] text-[#f5ede4] rounded-xl text-xs font-medium transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-[#c4b5a8]">
                  Ou selecione um avatar profissional:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                        previewPhoto === preset.url
                          ? 'border-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)]/40 scale-95'
                          : 'border-[#342c27] hover:border-[#52443c]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                        <span className="text-[10px] text-white font-medium truncate">
                          {preset.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFO & PIX */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-primary)] uppercase tracking-wider mb-1.5">
                    Seu Nome / Nome do Estúdio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="Ex: Studio Alvorada / Laíne Paula"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-primary)] uppercase tracking-wider mb-1.5">
                    Título Profissional
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="Ex: Arquiteta & Urbanista / Consultor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-primary)] uppercase tracking-wider mb-1.5">
                    Especialidade Principal
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="Ex: Interiores de Alto Padrão / Estrutural"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-primary)] uppercase tracking-wider mb-1.5">
                    Localização (Cidade, UF)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="Ex: São Paulo, SP ou Rio de Janeiro, RJ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--theme-primary)] uppercase tracking-wider mb-1.5">
                  Slogan / Frase de Apresentação
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] focus:outline-none focus:border-[var(--theme-primary)]"
                  placeholder="Ex: Projetos que transformam rotinas em experiências únicas."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--theme-primary)] uppercase tracking-wider mb-1.5">
                  Biografia / Apresentação do Escritório
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] focus:outline-none focus:border-[var(--theme-primary)] resize-none"
                  placeholder="Conte um pouco sobre sua trajetória, metodologia e compromisso com os clientes..."
                />
              </div>

              {/* Redes & Pix */}
              <div className="pt-3 border-t border-[#2d2621] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-primary)] uppercase tracking-wider mb-1.5">
                    Instagram (@perfil)
                  </label>
                  <input
                    type="text"
                    value={formData.instagramHandle}
                    onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="@seuescritorio"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-primary)] uppercase tracking-wider mb-1.5">
                    Chave Pix (Para envio em propostas/faturas)
                  </label>
                  <input
                    type="text"
                    value={formData.pixKey || ''}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="Chave Pix (CPF, CNPJ, E-mail ou Telefone)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-[#2d2621] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#201a17] hover:bg-[#2c241f] text-[#a89a8f] text-sm font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--theme-primary)] text-black font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvo com Sucesso!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
