import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  Globe,
  Image as ImageIcon,
  Instagram,
  MapPin,
  RefreshCw,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ArchitectProfile } from '../../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Curated preset avatars for architects
const PRESET_AVATARS = [
  {
    id: 'preset-1',
    label: 'Clássico Elegante',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-2',
    label: 'Studio & Prancheta',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-3',
    label: 'Minimalista Neutro',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-4',
    label: 'Biofílico & Luz',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-5',
    label: 'Executive & Obra',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { architectProfile, updateArchitectProfile, updateProfilePhoto } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'photo' | 'info'>('photo');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateArchitectProfile(formData);
    if (previewPhoto) {
      updateProfilePhoto(previewPhoto);
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
        className="relative w-full max-w-2xl bg-[#1a1614] border border-[#3d342f] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2d2621] bg-gradient-to-r from-[#241e1b] to-[#1a1614]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#c58a4b]/20 to-[#d48b8e]/20 border border-[#c58a4b]/30 text-[#c58a4b]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-[#f5ede4]">
                Foto & Perfil da Arquiteta
              </h2>
              <p className="text-xs text-[#a89a8f]">
                Personalize sua foto de perfil, bio e informações do estúdio
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
        <div className="flex border-b border-[#2d2621] bg-[#161311] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-2 py-3.5 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'photo'
                ? 'border-[#c58a4b] text-[#c58a4b]'
                : 'border-transparent text-[#8a7c73] hover:text-[#e5ddd5]'
            }`}
          >
            <Camera className="w-4 h-4" />
            Alterar Foto de Perfil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 py-3.5 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-[#c58a4b] text-[#c58a4b]'
                : 'border-transparent text-[#8a7c73] hover:text-[#e5ddd5]'
            }`}
          >
            <User className="w-4 h-4" />
            Dados da Bio & Redes
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'photo' && (
            <div className="space-y-6">
              {/* Photo Preview & Quick Upload Center */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[#201a17] border border-[#342c27]">
                {/* Avatar with dynamic ring */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#d48b8e] via-[#c58a4b] to-[#e29a9b] shadow-2xl">
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
                    <Camera className="w-6 h-6 mb-1 text-[#c58a4b]" />
                    <span className="text-[11px] font-medium">Trocar</span>
                  </button>
                </div>

                {/* Upload Actions */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h3 className="text-base font-medium text-[#f5ede4]">
                      {formData.name || 'Laíne Paula'}
                    </h3>
                    <p className="text-xs text-[#a89a8f]">
                      Recomendado: foto quadrada (1:1), formato JPG, PNG ou WebP com boa iluminação.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c58a4b] to-[#b3773a] text-[#12100e] font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Enviar Foto do Computador / Celular
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
                    ? 'border-[#c58a4b] bg-[#c58a4b]/10'
                    : 'border-[#3d342f] hover:border-[#c58a4b]/50 bg-[#161311]/60'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-[#241e1b] text-[#c58a4b]">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-[#f5ede4]">
                    Arraste e solte uma imagem aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-[#8a7c73]">
                    Arquivos suportados: JPEG, PNG, WEBP, GIF (máx 10MB)
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
                    className="flex-1 bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    disabled={!urlInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#2c241f] hover:bg-[#382f29] disabled:opacity-40 text-[#f5ede4] text-xs font-medium transition-colors"
                  >
                    Carregar Link
                  </button>
                </div>
              </div>

              {/* Presets Gallery */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c58a4b]" />
                  <h4 className="text-xs font-semibold text-[#c4b5a8] uppercase tracking-wider">
                    Opções de Retratos Profissionais (Presets)
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = previewPhoto === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url)}
                        className={`group flex flex-col items-center p-2 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-[#c58a4b]/15 border-[#c58a4b] shadow-lg'
                            : 'bg-[#201a17] border-[#342c27] hover:border-[#c58a4b]/50'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden mb-1.5 border border-[#3d342f] relative">
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#c58a4b]/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-[#c4b5a8] group-hover:text-white truncate max-w-full">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                    Nome da Arquiteta / Estúdio
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Laíne Paula"
                      className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                    Título Profissional
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Arquitetura e Interiores"
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                    Especialidade Principal
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Especialista em interiores residenciais"
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                    Localização & Modalidade
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#c58a4b]" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Rio Bonito / RJ • Presencial e à distância"
                      className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                  Frase de Destaque / Conceito (Tagline)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Casas funcionais, com estética e essência."
                  className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                  Descrição / Bio do Estúdio
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Transformando espaços com iluminação cênica, marcenaria inteligente e paletas acolhedoras..."
                  className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 w-4 h-4 text-[#d48b8e]" />
                    <input
                      type="text"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      placeholder="@arquitetalainepaula"
                      className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                    Link do Bio / Site Oficial
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-[#c58a4b]" />
                    <input
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                      placeholder="https://bio.site/lainepaulaarquitetura"
                      className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                    Texto de Seguidores / Alcance
                  </label>
                  <input
                    type="text"
                    value={formData.followersCount}
                    onChange={(e) => setFormData({ ...formData, followersCount: e.target.value })}
                    placeholder="63 mil seguidores"
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1.5">
                    Nota de Avaliação dos Clientes
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5 })}
                    className="w-full bg-[#14110f] border border-[#3d342f] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ede4] placeholder-[#6b5f56] focus:outline-none focus:border-[#c58a4b]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d2621]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#3d342f] text-[#c4b5a8] hover:text-[#f5ede4] hover:bg-[#241e1b] text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c58a4b] to-[#b3773a] text-[#12100e] font-semibold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#12100e]" />
                  Perfil Atualizado!
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
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
