import React, { useState } from 'react';
import {
  Briefcase,
  Building,
  Camera,
  CheckCircle2,
  ChevronRight,
  Compass,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  FolderPlus,
  Heart,
  ImagePlus,
  Instagram,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ArchitectureProject } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { AddProjectModal } from '../modals/AddProjectModal';
import { EditProfileModal } from '../modals/EditProfileModal';
import { ProjectDetailModal } from '../modals/ProjectDetailModal';

interface HomeProjectsTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewTxModal?: (initialType?: 'income' | 'expense') => void;
}

export const HomeProjectsTab: React.FC<HomeProjectsTabProps> = ({
  onNavigateTab,
  onOpenNewTxModal,
}) => {
  const {
    architectProfile,
    architectureProjects,
    clients,
    monthlyIncomeFreelance,
    totalNetWorth,
    addPhotoToProject,
  } = useFinance();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ArchitectureProject | null>(null);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<ArchitectureProject | null>(null);

  // Quick photo upload from card
  const handleQuickAddPhoto = (projectId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) addPhotoToProject(projectId, result);
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  // Filter projects
  const filteredProjects = architectureProjects.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'antes_depois'
        ? Boolean(p.beforeImage && p.afterImage)
        : p.category === selectedCategory;

    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Totals & Studio Stats
  const totalM2 = architectureProjects.reduce((acc, p) => acc + (p.areaM2 || 0), 0);
  const totalHonorarios = architectureProjects.reduce((acc, p) => acc + (p.honorarios || 0), 0);
  const inProgressProjectsCount = architectureProjects.filter(
    (p) => p.status === 'obra' || p.status === 'anteprojeto' || p.status === 'executivo'
  ).length;
  const deliveredProjectsCount = architectureProjects.filter((p) => p.status === 'entregue').length;

  const categories = [
    { id: 'all', label: 'Todos os Projetos' },
    { id: 'residencial', label: 'Residenciais' },
    { id: 'interiores', label: 'Interiores' },
    { id: 'cozinha_gourmet', label: 'Cozinhas & Gourmet' },
    { id: 'suite_master', label: 'Suítes Master' },
    { id: 'comercial', label: 'Comercial / Clínicas' },
    { id: 'antes_depois', label: '✨ Antes & Depois' },
  ];

  const getStatusBadge = (status: ArchitectureProject['status']) => {
    switch (status) {
      case 'estudo_preliminar':
        return { label: 'Estudo Preliminar', bg: 'bg-[#de9b9d]/20 text-[#e29a9b] border-[#de9b9d]/30' };
      case 'anteprojeto':
        return { label: 'Anteprojeto 3D', bg: 'bg-[#c58a4b]/20 text-[#d49454] border-[#c58a4b]/30' };
      case 'executivo':
        return { label: 'Projeto Executivo', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'obra':
        return { label: 'Em Obra', bg: 'bg-[#d97706]/20 text-[#f59e0b] border-[#d97706]/30' };
      case 'entregue':
        return { label: 'Entregue', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: status, bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero / Architect Bio Presentation Card (Instagram Theme) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#241e1b] via-[#1c1815] to-[#14110f] border border-[#3d342f] p-6 sm:p-8 shadow-2xl">
        {/* Subtle Decorative Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c58a4b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#d48b8e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Architect Bio & Photo */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar / Photo Frame with Click-to-Edit & Hover Badge */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="relative block w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#d48b8e] via-[#c58a4b] to-[#e29a9b] shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c58a4b]"
                title="Clique para trocar a foto de perfil"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1614] border-2 border-[#12100e] relative">
                  <img
                    src={
                      architectProfile.photoUrl ||
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={`${architectProfile.name} - ${architectProfile.title}`}
                    className="w-full h-full object-cover object-top group-hover:brightness-75 transition-all"
                  />
                  {/* Hover Overlay with Camera */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200">
                    <Camera className="w-6 h-6 text-[#c58a4b] mb-1 drop-shadow" />
                    <span className="text-[11px] font-bold text-[#fcf8f5] tracking-wide uppercase">
                      Trocar Foto
                    </span>
                  </div>
                </div>
              </button>

              {/* Floating Camera Button on Avatar Edge */}
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-gradient-to-br from-[#c58a4b] to-[#a36829] text-[#12100e] border-2 border-[#12100e] shadow-lg hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                title="Alterar foto de perfil"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Bio Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] font-serif tracking-tight">
                  {architectProfile.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#c58a4b]/20 text-[#d49454] border border-[#c58a4b]/30">
                  {architectProfile.title}
                </span>
                {/* Quick Edit Profile Button */}
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#28221e] hover:bg-[#342c27] text-[#c58a4b] hover:text-[#d49454] text-xs font-medium border border-[#3d342f] transition-all cursor-pointer"
                  title="Alterar foto e informações do perfil"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Mudar Foto / Perfil</span>
                </button>
              </div>

              <p className="text-sm font-medium text-[#e8ded7] flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-4 h-4 text-[#d48b8e]" /> {architectProfile.location}
              </p>

              <p className="text-xs text-[#a89c93] max-w-xl leading-relaxed">
                📐 <strong className="text-[#fcf8f5]">{architectProfile.specialty}</strong>
                <br />
                🌿 <em>{architectProfile.tagline}</em> {architectProfile.description}
              </p>

              {/* Instagram & Bio link */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
                <a
                  href={architectProfile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#28221e] hover:bg-[#342c27] text-xs font-medium text-[#fcf8f5] border border-[#3d342f] transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#d48b8e]" />
                  {architectProfile.instagramHandle}
                  <ExternalLink className="w-3 h-3 text-[#a89c93]" />
                </a>

                <span className="text-xs text-[#a89c93] flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {architectProfile.rating.toFixed(1)} • {architectProfile.followersCount}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-row sm:flex-col gap-3 w-full lg:w-auto justify-center sm:justify-end">
            <button
              onClick={() => {
                setEditingProject(null);
                setIsAddModalOpen(true);
              }}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-[#c58a4b] hover:bg-[#d49454] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#c58a4b]/20 transition-all active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Novo Projeto / Fotos</span>
            </button>

            <button
              onClick={() => onNavigateTab('overview')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#28221e] hover:bg-[#342c27] text-[#e8ded7] font-semibold text-xs flex items-center justify-center gap-2 border border-[#3d342f] transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-[#c58a4b]" />
              <span>Painel Financeiro Geral</span>
            </button>
          </div>
        </div>

        {/* Instagram 3 Story Highlight Badges */}
        <div className="mt-6 pt-6 border-t border-[#3d342f]/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-[#14110f]/80 border border-[#3d342f] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d48b8e]/20 border border-[#d48b8e]/40 flex items-center justify-center text-[#d48b8e] font-serif font-bold text-sm">
              R$
            </div>
            <div>
              <span className="text-xs font-bold text-[#fcf8f5] block font-serif">Quanto custa?</span>
              <span className="text-[11px] text-[#a89c93]">Orçamentos transparentes por m² e escopo</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14110f]/80 border border-[#3d342f] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c58a4b]/20 border border-[#c58a4b]/40 flex items-center justify-center text-[#d49454] font-bold text-sm">
              ★
            </div>
            <div>
              <span className="text-xs font-bold text-[#fcf8f5] block font-serif">Feedbacks Reais</span>
              <span className="text-[11px] text-[#a89c93]">Ambientes que transformam vidas e famílias</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14110f]/80 border border-[#3d342f] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#48322c] border border-[#6b4941] flex items-center justify-center text-[#e8ded7] font-bold text-sm">
              📋
            </div>
            <div>
              <span className="text-xs font-bold text-[#fcf8f5] block font-serif">Proposta & Contrato</span>
              <span className="text-[11px] text-[#a89c93]">Consultoria online ou projeto executivo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Studio Metrics Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1a1614] border border-[#3d342f] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#a89c93]">
            <span>Total de Projetos</span>
            <Building className="w-4 h-4 text-[#c58a4b]" />
          </div>
          <p className="text-2xl font-bold text-[#fcf8f5] font-serif">
            {architectureProjects.length}
          </p>
          <span className="text-[11px] text-[#d48b8e]">
            {deliveredProjectsCount} entregues • {inProgressProjectsCount} em andamento
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1a1614] border border-[#3d342f] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#a89c93]">
            <span>Área Total Projetada</span>
            <Layers className="w-4 h-4 text-[#d48b8e]" />
          </div>
          <p className="text-2xl font-bold text-[#fcf8f5] font-serif">
            {totalM2} <span className="text-sm font-sans font-normal text-[#a89c93]">m²</span>
          </p>
          <span className="text-[11px] text-[#a89c93]">Interiores & Arquitetura</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1a1614] border border-[#3d342f] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#a89c93]">
            <span>Honorários de Projetos</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-serif">
            {formatCurrency(totalHonorarios)}
          </p>
          <span className="text-[11px] text-[#a89c93]">Valor total contratado</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1a1614] border border-[#3d342f] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#a89c93]">
            <span>Clientes Atendidos</span>
            <Users className="w-4 h-4 text-[#c58a4b]" />
          </div>
          <p className="text-2xl font-bold text-[#fcf8f5] font-serif">{clients.length}</p>
          <button
            onClick={() => onNavigateTab('freelance')}
            className="text-[11px] text-[#d49454] hover:underline flex items-center gap-0.5"
          >
            Ver cadastro de clientes →
          </button>
        </div>
      </section>

      {/* 3. Project Gallery & Photo Showcase */}
      <section className="space-y-5">
        {/* Controls Bar: Search & Category Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#fcf8f5] font-serif flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#c58a4b]" />
              <span>Projetos & Portfólio de Interiores</span>
            </h2>
            <p className="text-xs text-[#a89c93]">
              Fotos de projetos realizados, renders 3D, especificações e acompanhamento de obras.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#a89c93] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por projeto, cliente ou material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1a1614] border border-[#3d342f] text-xs text-[#fcf8f5] placeholder-[#a89c93] focus:outline-none focus:border-[#c58a4b] transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#1a1614] border border-[#3d342f] text-xs text-[#fcf8f5] focus:outline-none focus:border-[#c58a4b] transition-colors"
            >
              <option value="all">Todos os Status</option>
              <option value="estudo_preliminar">Estudo Preliminar</option>
              <option value="anteprojeto">Anteprojeto 3D</option>
              <option value="executivo">Projeto Executivo</option>
              <option value="obra">Em Obra</option>
              <option value="entregue">Fotografado / Entregue</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#c58a4b] text-black shadow-md shadow-[#c58a4b]/20 font-bold'
                    : 'bg-[#1a1614] text-[#a89c93] hover:text-[#fcf8f5] hover:bg-[#28221e] border border-[#3d342f]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Projects Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#1a1614] border border-dashed border-[#3d342f] rounded-2xl">
            <Camera className="w-10 h-10 text-[#a89c93] mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-[#fcf8f5] font-serif mb-1">
              Nenhum projeto encontrado
            </h3>
            <p className="text-xs text-[#a89c93] mb-4">
              Não encontramos projetos para os filtros selecionados.
            </p>
            <button
              onClick={() => {
                setEditingProject(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#c58a4b] text-black font-bold text-xs"
            >
              + Adicionar Novo Projeto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => {
              const statusBadge = getStatusBadge(proj.status);
              const totalPhotos = (proj.images || []).length || 1;
              const hasBeforeAfter = Boolean(proj.beforeImage && proj.afterImage);

              return (
                <div
                  key={proj.id}
                  className="group relative flex flex-col bg-[#1a1614] border border-[#3d342f] hover:border-[#c58a4b]/60 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Project Image & Overlay */}
                  <div
                    className="relative aspect-video sm:h-56 w-full overflow-hidden bg-[#12100e] cursor-pointer"
                    onClick={() => setSelectedProjectForDetail(proj)}
                  >
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14110f] via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow backdrop-blur-md ${statusBadge.bg}`}
                      >
                        {statusBadge.label}
                      </span>
                      {hasBeforeAfter && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d48b8e]/90 text-black border border-[#d48b8e] shadow">
                          Antes & Depois
                        </span>
                      )}
                    </div>

                    {/* Photos count badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-medium backdrop-blur-md flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-[#c58a4b]" />
                      <span>{totalPhotos} foto(s)</span>
                    </div>

                    {/* Quick Expand hover icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="px-4 py-2 rounded-xl bg-black/80 text-[#fcf8f5] text-xs font-bold flex items-center gap-1.5 border border-[#3d342f] shadow-2xl backdrop-blur-md">
                        <Eye className="w-4 h-4 text-[#c58a4b]" /> Ver Galeria Completa
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[#d48b8e] uppercase tracking-wider">
                          {proj.category.replace('_', ' ')}
                        </span>
                        {proj.areaM2 && (
                          <span className="text-xs text-[#a89c93] flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#c58a4b]" /> {proj.areaM2} m²
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setSelectedProjectForDetail(proj)}
                        className="text-lg font-bold text-[#fcf8f5] font-serif leading-snug hover:text-[#c58a4b] transition-colors cursor-pointer"
                      >
                        {proj.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-[#a89c93] pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#c58a4b]" /> {proj.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#d48b8e]" /> {proj.location}
                        </span>
                      </div>

                      {proj.description && (
                        <p className="text-xs text-[#a89c93] line-clamp-2 pt-1 font-sans">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    {/* Tags preview */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#241e1b] text-[10px] text-[#e8ded7] border border-[#3d342f]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Actions Bar */}
                    <div className="pt-3 border-t border-[#2d2622] flex items-center justify-between gap-2">
                      {proj.honorarios ? (
                        <div>
                          <span className="text-[10px] text-[#a89c93] block">Honorários</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {formatCurrency(proj.honorarios)}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickAddPhoto(proj.id)}
                          className="p-2 rounded-lg bg-[#28221e] hover:bg-[#3d342f] text-[#d48b8e] hover:text-[#e29a9b] border border-[#3d342f] transition-colors"
                          title="Adicionar mais fotos a este projeto"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setIsAddModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#28221e] hover:bg-[#3d342f] text-xs font-medium text-[#fcf8f5] border border-[#3d342f] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setSelectedProjectForDetail(proj)}
                          className="px-3 py-1.5 rounded-lg bg-[#c58a4b]/20 hover:bg-[#c58a4b]/30 text-[#d49454] text-xs font-bold border border-[#c58a4b]/30 transition-colors"
                        >
                          Ver Fotos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Modals */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProject(null);
        }}
        initialProject={editingProject}
      />

      <ProjectDetailModal
        project={selectedProjectForDetail}
        isOpen={Boolean(selectedProjectForDetail)}
        onClose={() => setSelectedProjectForDetail(null)}
        onEdit={(proj) => {
          setSelectedProjectForDetail(null);
          setEditingProject(proj);
          setIsAddModalOpen(true);
        }}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />
    </div>
  );
};

