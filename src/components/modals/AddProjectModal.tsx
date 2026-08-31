import React, { useState } from 'react';
import {
  Camera,
  Check,
  FolderPlus,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ArchitectureProject } from '../../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: ArchitectureProject | null;
}

const CATEGORY_OPTIONS = [
  { value: 'residencial', label: 'Residencial Completo' },
  { value: 'interiores', label: 'Design de Interiores' },
  { value: 'cozinha_gourmet', label: 'Cozinha & Espaço Gourmet' },
  { value: 'suite_master', label: 'Suíte Master & Closet' },
  { value: 'living', label: 'Salas & Living Integrado' },
  { value: 'comercial', label: 'Comercial & Consultório' },
  { value: 'consultoria', label: 'Consultoria de Ambientes' },
];

const STATUS_OPTIONS = [
  { value: 'estudo_preliminar', label: 'Estudo Preliminar' },
  { value: 'anteprojeto', label: 'Anteprojeto 3D' },
  { value: 'executivo', label: 'Projeto Executivo' },
  { value: 'obra', label: 'Em Obra / Acompanhamento' },
  { value: 'entregue', label: 'Fotografado & Entregue' },
];

// Sample architectural photos for quick insertion
const PRESET_PHOTOS = [
  {
    name: 'Living Integrado & Madeira',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cozinha Gourmet Contemporânea',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Interiores Tons Terrosos & Boiserie',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Suíte Master com Iluminação Cênica',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sala de Estar Minimalista Aconchegante',
    url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Consultório / Recepção Sofisticada',
    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
  },
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  initialProject,
}) => {
  const { addArchitectureProject, updateArchitectureProject, clients } = useFinance();

  const [title, setTitle] = useState(initialProject?.title || '');
  const [clientName, setClientName] = useState(initialProject?.clientName || '');
  const [category, setCategory] = useState<ArchitectureProject['category']>(
    initialProject?.category || 'residencial'
  );
  const [location, setLocation] = useState(initialProject?.location || 'Rio Bonito, RJ');
  const [state, setState] = useState(initialProject?.state || 'RJ');
  const [areaM2, setAreaM2] = useState<string>(
    initialProject?.areaM2 ? String(initialProject.areaM2) : ''
  );
  const [honorarios, setHonorarios] = useState<string>(
    initialProject?.honorarios ? String(initialProject.honorarios) : ''
  );
  const [status, setStatus] = useState<ArchitectureProject['status']>(
    initialProject?.status || 'estudo_preliminar'
  );
  const [coverImage, setCoverImage] = useState(
    initialProject?.coverImage || PRESET_PHOTOS[0].url
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialProject?.images && initialProject.images.length > 0
      ? initialProject.images
      : [PRESET_PHOTOS[0].url]
  );
  const [beforeImage, setBeforeImage] = useState(initialProject?.beforeImage || '');
  const [afterImage, setAfterImage] = useState(initialProject?.afterImage || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [deliveryDate, setDeliveryDate] = useState(initialProject?.deliveryDate || '');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialProject?.tags || ['Interiores', 'Rio Bonito']);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'gallery' | 'before' | 'after') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) return;

        if (target === 'cover') {
          setCoverImage(result);
          if (!galleryImages.includes(result)) {
            setGalleryImages((prev) => [result, ...prev]);
          }
        } else if (target === 'gallery') {
          setGalleryImages((prev) => [...prev, result]);
          if (!coverImage) setCoverImage(result);
        } else if (target === 'before') {
          setBeforeImage(result);
        } else if (target === 'after') {
          setAfterImage(result);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setGalleryImages((prev) => [...prev, newImageUrl.trim()]);
    if (!coverImage) setCoverImage(newImageUrl.trim());
    setNewImageUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (coverImage === prev[index] && next.length > 0) {
        setCoverImage(next[0]);
      }
      return next;
    });
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags((prev) => [...prev, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    const projectData = {
      title: title.trim(),
      clientName: clientName.trim(),
      category,
      location: location.trim() || 'Rio Bonito, RJ',
      state: state.toUpperCase(),
      areaM2: areaM2 ? parseFloat(areaM2) : undefined,
      honorarios: honorarios ? parseFloat(honorarios) : undefined,
      status,
      coverImage: coverImage || galleryImages[0] || PRESET_PHOTOS[0].url,
      images: galleryImages.length > 0 ? galleryImages : [coverImage || PRESET_PHOTOS[0].url],
      beforeImage: beforeImage.trim() || undefined,
      afterImage: afterImage.trim() || undefined,
      description: description.trim() || undefined,
      deliveryDate: deliveryDate || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (initialProject) {
      updateArchitectureProject(initialProject.id, projectData);
    } else {
      addArchitectureProject(projectData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#1a1614] border border-[#3d342f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3d342f] bg-[#14110f]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c58a4b]/20 border border-[#c58a4b]/30 flex items-center justify-center text-[#d49454]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#fcf8f5] font-serif">
                {initialProject ? 'Editar Projeto de Arquitetura' : 'Novo Projeto de Arquitetura & Fotos'}
              </h2>
              <p className="text-xs text-[#a89c93]">
                Cadastre o projeto de interiores, especificações e adicione fotos do ambiente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a89c93] hover:text-[#fcf8f5] hover:bg-[#28221e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                Nome do Projeto *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Apartamento Icaraí - Living & Gourmet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-sm focus:outline-none focus:border-[#c58a4b] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Mariana & Rodrigo Silveira"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                list="client-suggestions"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-sm focus:outline-none focus:border-[#c58a4b] transition-colors"
              />
              <datalist id="client-suggestions">
                {clients.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                Categoria do Ambiente
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArchitectureProject['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-sm focus:outline-none focus:border-[#c58a4b] transition-colors"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                Status do Projeto
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArchitectureProject['status'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-sm focus:outline-none focus:border-[#c58a4b] transition-colors"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                Cidade / Localização
              </label>
              <input
                type="text"
                placeholder="Ex: Rio Bonito, RJ"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-sm focus:outline-none focus:border-[#c58a4b] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                  Área (m²)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 120"
                  value={areaM2}
                  onChange={(e) => setAreaM2(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-sm focus:outline-none focus:border-[#c58a4b] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                  Honorários (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 14500"
                  value={honorarios}
                  onChange={(e) => setHonorarios(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-sm focus:outline-none focus:border-[#c58a4b] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Photos Showcase & Upload Section */}
          <div className="p-4 rounded-xl bg-[#14110f] border border-[#3d342f] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#d48b8e]" />
                <h3 className="text-sm font-bold text-[#fcf8f5]">Fotos do Projeto & Galeria</h3>
              </div>
              <span className="text-xs text-[#a89c93]">{galleryImages.length} foto(s)</span>
            </div>

            {/* Quick Upload / File Drop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#4a3e37] hover:border-[#c58a4b] rounded-xl bg-[#1b1714]/60 cursor-pointer transition-colors text-center group">
                <Upload className="w-6 h-6 text-[#c58a4b] mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[#fcf8f5]">Carregar Fotos do Computador/Celular</span>
                <span className="text-[10px] text-[#a89c93]">JPG, PNG, WebP (Múltiplas fotos suportadas)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'gallery')}
                  className="hidden"
                />
              </label>

              <div className="flex flex-col justify-center gap-2 p-3 bg-[#1b1714]/60 border border-[#3d342f] rounded-xl">
                <span className="text-xs font-medium text-[#a89c93]">Ou adicionar link de foto (URL):</span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#12100e] border border-[#3d342f] text-xs text-[#fcf8f5] focus:outline-none focus:border-[#c58a4b]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 rounded-lg bg-[#c58a4b] hover:bg-[#d49454] text-black font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Presets Quick Picker */}
            <div>
              <span className="text-[11px] text-[#a89c93] block mb-1.5 font-medium">
                💡 Fotos modelo de arquitetura para inspiração rápida:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!galleryImages.includes(preset.url)) {
                        setGalleryImages((prev) => [...prev, preset.url]);
                      }
                      if (!coverImage) setCoverImage(preset.url);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#28221e] hover:bg-[#3d342f] text-[11px] text-[#e8ded7] border border-[#4a3e37] transition-colors"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Thumbnails Strip */}
            {galleryImages.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#2d2622]">
                <span className="text-xs font-semibold text-[#d48b8e]">Galeria Atual (Clique para definir a Capa):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {galleryImages.map((img, idx) => {
                    const isCover = coverImage === img;
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border-2 aspect-video group cursor-pointer transition-all ${
                          isCover ? 'border-[#c58a4b] ring-2 ring-[#c58a4b]/30' : 'border-[#3d342f] opacity-80 hover:opacity-100'
                        }`}
                        onClick={() => setCoverImage(img)}
                      >
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        {isCover && (
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#c58a4b] text-black font-bold text-[10px] shadow">
                            Capa
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveGalleryImage(idx);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Antes e Depois (Transformação) */}
          <div className="p-4 rounded-xl bg-[#14110f] border border-[#3d342f] space-y-3">
            <h3 className="text-sm font-bold text-[#fcf8f5] flex items-center gap-2">
              <span>✨ Antes e Depois (Transformação da Reforma - Opcional)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#a89c93] mb-1">Foto do ANTES (Estado Original)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="URL foto antes"
                    value={beforeImage}
                    onChange={(e) => setBeforeImage(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#12100e] border border-[#3d342f] text-xs text-[#fcf8f5]"
                  />
                  <label className="px-2.5 py-1.5 rounded-lg bg-[#28221e] hover:bg-[#3d342f] text-xs text-[#fcf8f5] cursor-pointer flex items-center">
                    <Upload className="w-3.5 h-3.5 mr-1" /> Arquivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'before')}
                      className="hidden"
                    />
                  </label>
                </div>
                {beforeImage && (
                  <div className="h-28 rounded-lg overflow-hidden border border-[#3d342f]">
                    <img src={beforeImage} alt="Antes" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#a89c93] mb-1">Foto do DEPOIS (Projeto Finalizado)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="URL foto depois"
                    value={afterImage}
                    onChange={(e) => setAfterImage(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#12100e] border border-[#3d342f] text-xs text-[#fcf8f5]"
                  />
                  <label className="px-2.5 py-1.5 rounded-lg bg-[#28221e] hover:bg-[#3d342f] text-xs text-[#fcf8f5] cursor-pointer flex items-center">
                    <Upload className="w-3.5 h-3.5 mr-1" /> Arquivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'after')}
                      className="hidden"
                    />
                  </label>
                </div>
                {afterImage && (
                  <div className="h-28 rounded-lg overflow-hidden border border-[#3d342f]">
                    <img src={afterImage} alt="Depois" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description & Tags */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                Conceito & Detalhes do Projeto
              </label>
              <textarea
                rows={3}
                placeholder="Descreva os materiais, paleta de cores (tons terrosos, madeira freijó, iluminação quente 2700K), soluções funcionais de marcenaria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-sm focus:outline-none focus:border-[#c58a4b] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d49454] uppercase tracking-wider mb-1.5">
                Tags & Materiais
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ex: Madeira Freijó, Iluminação Cênica, Boiserie"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#12100e] border border-[#3d342f] text-[#fcf8f5] text-xs focus:outline-none focus:border-[#c58a4b]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 rounded-xl bg-[#28221e] hover:bg-[#3d342f] text-xs font-medium text-[#fcf8f5] border border-[#4a3e37]"
                >
                  + Adicionar Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#28221e] text-xs text-[#e8ded7] border border-[#3d342f]"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3d342f]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#28221e] hover:bg-[#342d28] text-xs font-semibold text-[#e8ded7] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#c58a4b] hover:bg-[#d49454] text-black font-bold text-xs shadow-lg shadow-[#c58a4b]/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {initialProject ? 'Salvar Alterações' : 'Publicar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
