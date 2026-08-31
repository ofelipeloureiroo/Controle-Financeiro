import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { BRAZIL_STATES } from '../../data/brazilMapData';
import { useFinance } from '../../context/FinanceContext';
import { Client, FreelanceProject } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface FreelanceClientsTabProps {
  onNavigateToMap: () => void;
}

export const FreelanceClientsTab: React.FC<FreelanceClientsTabProps> = ({
  onNavigateToMap,
}) => {
  const {
    clients,
    freelanceProjects,
    bankAccounts,
    addClient,
    updateClient,
    deleteClient,
    addFreelanceProject,
    updateFreelanceProject,
    deleteFreelanceProject,
    receiveProjectPayment,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'projects'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('all');

  // Client modal state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientState, setClientState] = useState('SP');
  const [clientCity, setClientCity] = useState('');
  const [clientService, setClientService] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Project modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FreelanceProject | null>(null);
  const [projClientId, setProjClientId] = useState('');
  const [projTitle, setProjTitle] = useState('');
  const [projService, setProjService] = useState('');
  const [projTotalVal, setProjTotalVal] = useState('');
  const [projPaidVal, setProjPaidVal] = useState('');
  const [projDeadline, setProjDeadline] = useState('');
  const [projStartDate, setProjStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [projStatus, setProjStatus] = useState<FreelanceProject['status']>('in_progress');

  // Payment receive modal
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState(false);
  const [selectedProjForPay, setSelectedProjForPay] = useState<FreelanceProject | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payAccountId, setPayAccountId] = useState(bankAccounts[0]?.id || '');

  // Computed metrics
  const totalBilledAllTime = clients.reduce((sum, c) => sum + (c.totalBilled || 0), 0);
  const totalPaidAllTime = clients.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  const totalPendingAllTime = clients.reduce((sum, c) => sum + (c.pendingAmount || 0), 0);
  const activeProjectsCount = freelanceProjects.filter((p) => p.status === 'in_progress').length;

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (selectedStateFilter !== 'all' && c.state.toUpperCase() !== selectedStateFilter.toUpperCase()) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(term);
        const matchesCompany = c.company?.toLowerCase().includes(term);
        const matchesCity = c.city.toLowerCase().includes(term);
        const matchesService = c.serviceType.toLowerCase().includes(term);
        if (!matchesName && !matchesCompany && !matchesCity && !matchesService) return false;
      }
      return true;
    });
  }, [clients, selectedStateFilter, searchTerm]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return freelanceProjects.filter((p) => {
      if (selectedStateFilter !== 'all' && p.state.toUpperCase() !== selectedStateFilter.toUpperCase()) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesClient = p.clientName.toLowerCase().includes(term);
        const matchesCity = p.city.toLowerCase().includes(term);
        if (!matchesTitle && !matchesClient && !matchesCity) return false;
      }
      return true;
    });
  }, [freelanceProjects, selectedStateFilter, searchTerm]);

  // Handlers for client modal
  const handleOpenAddClient = () => {
    setEditingClient(null);
    setClientName('');
    setClientCompany('');
    setClientEmail('');
    setClientPhone('');
    setClientState('SP');
    setClientCity('');
    setClientService('');
    setClientNotes('');
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (c: Client) => {
    setEditingClient(c);
    setClientName(c.name);
    setClientCompany(c.company || '');
    setClientEmail(c.email || '');
    setClientPhone(c.phone || '');
    setClientState(c.state);
    setClientCity(c.city);
    setClientService(c.serviceType);
    setClientNotes(c.notes || '');
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientState || !clientCity) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        name: clientName,
        company: clientCompany,
        email: clientEmail,
        phone: clientPhone,
        state: clientState.toUpperCase(),
        city: clientCity,
        serviceType: clientService || 'Serviços Freelancer',
        notes: clientNotes,
      });
    } else {
      addClient({
        name: clientName,
        company: clientCompany,
        email: clientEmail,
        phone: clientPhone,
        state: clientState.toUpperCase(),
        city: clientCity,
        serviceType: clientService || 'Serviços Freelancer',
        notes: clientNotes,
        status: 'active',
      });
    }
    setIsClientModalOpen(false);
  };

  // Handlers for project modal
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjClientId(clients[0]?.id || '');
    setProjTitle('');
    setProjService('Desenvolvimento & Design');
    setProjTotalVal('');
    setProjPaidVal('0');
    setProjStartDate(new Date().toISOString().split('T')[0]);
    setProjDeadline('');
    setProjStatus('in_progress');
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === projClientId);
    if (!client || !projTitle.trim()) return;

    const totalVal = parseFloat(projTotalVal.replace(',', '.')) || 0;
    const paidVal = parseFloat(projPaidVal.replace(',', '.')) || 0;

    if (editingProject) {
      updateFreelanceProject(editingProject.id, {
        title: projTitle,
        serviceType: projService,
        totalValue: totalVal,
        paidValue: paidVal,
        status: projStatus,
        startDate: projStartDate,
        deadline: projDeadline,
      });
    } else {
      addFreelanceProject({
        clientId: client.id,
        clientName: client.name,
        title: projTitle,
        serviceType: projService,
        state: client.state,
        city: client.city,
        totalValue: totalVal,
        paidValue: paidVal,
        status: projStatus,
        startDate: projStartDate,
        deadline: projDeadline,
      });
    }
    setIsProjectModalOpen(false);
  };

  const handleOpenReceivePayment = (proj: FreelanceProject) => {
    setSelectedProjForPay(proj);
    const remaining = Math.max(0, proj.totalValue - proj.paidValue);
    setPayAmount(remaining.toString());
    setPayAccountId(bankAccounts[0]?.id || '');
    setIsReceivePaymentOpen(true);
  };

  const handleConfirmReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjForPay) return;
    const amount = parseFloat(payAmount.replace(',', '.')) || 0;
    if (amount <= 0) return;

    receiveProjectPayment(selectedProjForPay.id, amount, payAccountId);
    setIsReceivePaymentOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Briefcase className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-[#fafafa] tracking-tight">
              Gestão de Freelancer & Clientes
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1 max-w-2xl">
            Cadastre seus clientes, identifique o estado e cidade no Brasil, acompanhe projetos e valores a receber.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ver no Mapa do Brasil</span>
          </button>

          <button
            onClick={handleOpenAddClient}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
          <span className="text-[11px] text-[#a1a1aa] block font-semibold uppercase tracking-wider">Faturamento Total Freela</span>
          <div className="text-2xl font-bold text-[#fafafa] mt-1">
            {formatCurrency(totalBilledAllTime)}
          </div>
          <span className="text-[10px] text-[#71717a] mt-1 block">Histórico de todos os projetos</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
          <span className="text-[11px] text-[#a1a1aa] block font-semibold uppercase tracking-wider">Total Já Recebido</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {formatCurrency(totalPaidAllTime)}
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">Depositado em conta</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
          <span className="text-[11px] text-[#a1a1aa] block font-semibold uppercase tracking-wider">Valores a Receber</span>
          <div className="text-2xl font-bold text-yellow-500 mt-1">
            {formatCurrency(totalPendingAllTime)}
          </div>
          <span className="text-[10px] text-yellow-500/80 mt-1 block">A receber de clientes</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
          <span className="text-[11px] text-[#a1a1aa] block font-semibold uppercase tracking-wider">Clientes Cadastrados</span>
          <div className="text-2xl font-bold text-[#fafafa] mt-1">
            {clients.length} clientes
          </div>
          <span className="text-[10px] text-[#71717a] mt-1 block">
            {activeProjectsCount} projeto(s) em andamento
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Clientes vs Projetos */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('clients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'clients'
                ? 'bg-[#27272a] text-[#fafafa] border border-[#3f3f46]'
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Clientes ({filteredClients.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'projects'
                ? 'bg-[#27272a] text-[#fafafa] border border-[#3f3f46]'
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Projetos & Freelas ({filteredProjects.length})</span>
          </button>
        </div>

        {activeSubTab === 'projects' && (
          <button
            onClick={handleOpenAddProject}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        )}
      </div>

      {/* Search and State Filter */}
      <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, empresa, cidade ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Filtrar por Estado (Todos)</option>
            {BRAZIL_STATES.map((st) => (
              <option key={st.uf} value={st.uf}>
                {st.uf} - {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CLIENTS TAB VIEW */}
      {activeSubTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((cli) => (
            <div
              key={cli.id}
              className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {cli.state}
                      </span>
                      <h3 className="font-bold text-[#fafafa] text-sm">{cli.name}</h3>
                    </div>
                    {cli.company && (
                      <p className="text-[11px] text-[#a1a1aa] mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#71717a]" />
                        {cli.company}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditClient(cli)}
                      className="p-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] transition-colors cursor-pointer"
                      title="Editar Cliente"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteClient(cli.id)}
                      className="p-1.5 rounded-lg bg-[#27272a] hover:bg-rose-500/20 text-[#a1a1aa] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remover Cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Location & Service */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[#fafafa] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {cli.city} - {cli.state} (Brasil)
                    </span>
                  </div>

                  <div className="text-[11px] text-[#a1a1aa] truncate">
                    Serviço: <strong className="text-[#fafafa]">{cli.serviceType}</strong>
                  </div>
                </div>

                {/* Contact info */}
                {(cli.phone || cli.email) && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-[#a1a1aa]">
                    {cli.phone && (
                      <a
                        href={`https://wa.me/55${cli.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-[11px]"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                    {cli.email && (
                      <a
                        href={`mailto:${cli.email}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] transition-colors text-[11px]"
                      >
                        <Mail className="w-3 h-3" /> Email
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Billing stats */}
              <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#71717a] block">Total Faturado</span>
                  <span className="font-bold text-[#fafafa] text-sm">
                    {formatCurrency(cli.totalBilled)}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cli.pendingAmount > 0
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {cli.pendingAmount > 0 ? `Pendente: ${formatCurrency(cli.pendingAmount)}` : '100% Quitado'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROJECTS TAB VIEW */}
      {activeSubTab === 'projects' && (
        <div className="space-y-3">
          {filteredProjects.map((proj) => {
            const progress = proj.totalValue > 0 ? (proj.paidValue / proj.totalValue) * 100 : 0;
            const remaining = Math.max(0, proj.totalValue - proj.paidValue);

            return (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {proj.state}
                    </span>
                    <h4 className="font-bold text-[#fafafa] text-sm">{proj.title}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#27272a] text-[#a1a1aa]">
                      {proj.serviceType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#a1a1aa] flex-wrap">
                    <span className="text-blue-400 font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3" /> Cliente: {proj.clientName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#fafafa]">
                      <MapPin className="w-3 h-3 text-[#71717a]" /> {proj.city}/{proj.state}
                    </span>
                    {proj.deadline && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Entrega: {formatDate(proj.deadline)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5">
                  <div className="text-right">
                    <div className="font-bold text-[#fafafa] text-sm sm:text-base">
                      {formatCurrency(proj.totalValue)}
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium block">
                      Pago: {formatCurrency(proj.paidValue)} ({progress.toFixed(0)}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {remaining > 0 ? (
                      <button
                        onClick={() => handleOpenReceivePayment(proj)}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Receber {formatCurrency(remaining)}
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                        ✓ Totalmente Pago
                      </span>
                    )}

                    <button
                      onClick={() => deleteFreelanceProject(proj.id)}
                      className="p-1.5 rounded-lg bg-[#27272a] hover:bg-rose-500/20 text-[#a1a1aa] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Excluir Projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#18181b] border border-[#27272a] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#fafafa]">
              {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente no Brasil'}
            </h3>

            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Silva, Studio Arquitetura..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Empresa / Razão Social</label>
                  <input
                    type="text"
                    placeholder="Ex: Studio AD Ltda"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* State and City Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Estado (UF do Brasil) *</label>
                  <select
                    value={clientState}
                    onChange={(e) => setClientState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500 cursor-pointer"
                    required
                  >
                    {BRAZIL_STATES.map((st) => (
                      <option key={st.uf} value={st.uf}>
                        {st.uf} - {st.name} ({st.region})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Cidade *</label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo, Campinas, Curitiba..."
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 98765-4321"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="cliente@empresa.com.br"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Tipo Principal de Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: Criação de Site, Identidade Visual, Tráfego Pago, Consultoria..."
                  value={clientService}
                  onChange={(e) => setClientService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Notas / Observações</label>
                <textarea
                  rows={2}
                  placeholder="Observações sobre o cliente, forma de pagamento preferida..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold cursor-pointer"
                >
                  {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#18181b] border border-[#27272a] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#fafafa]">Cadastrar Novo Projeto Freelancer</h3>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Cliente *</label>
                <select
                  value={projClientId}
                  onChange={(e) => setProjClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500 cursor-pointer"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city}/{c.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Título do Projeto *</label>
                <input
                  type="text"
                  placeholder="Ex: Redesign do Portal Web, E-commerce de Vinhos..."
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Valor Total do Projeto (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={projTotalVal}
                    onChange={(e) => setProjTotalVal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Sinal Já Recebido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={projPaidVal}
                    onChange={(e) => setProjPaidVal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={projStartDate}
                    onChange={(e) => setProjStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer"
                >
                  Cadastrar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {isReceivePaymentOpen && selectedProjForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#18181b] border border-[#27272a] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#fafafa]">
              Registrar Recebimento de Freelancer
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              Projeto: <strong className="text-[#fafafa]">{selectedProjForPay.title}</strong> ({selectedProjForPay.clientName})
            </p>

            <form onSubmit={handleConfirmReceivePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Valor Recebido (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] text-base font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Conta de Destino</label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({formatCurrency(b.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsReceivePaymentOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer"
                >
                  Confirmar Entrada no Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
