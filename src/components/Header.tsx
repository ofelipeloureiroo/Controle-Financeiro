import React, { useState } from 'react';
import {
  Banknote,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Download,
  FolderOpen,
  Globe,
  Home,
  Instagram,
  MapPin,
  PieChart,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTxModal: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTxModal,
  onOpenSettings,
}) => {
  const {
    architectProfile,
    totalNetWorth,
    totalPhysicalCash,
    selectedMonth,
    setSelectedMonth,
    statesWithJobsCount,
    architectureProjects,
    dueSoonInstallments,
    overdueInstallments,
    dueSoonMilestones,
    overdueMilestones,
  } = useFinance();

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const totalDeadlinesAlerts =
    dueSoonInstallments.length +
    overdueInstallments.length +
    dueSoonMilestones.length +
    overdueMilestones.length;

  const navItems = [
    { id: 'home', label: 'Home & Projetos', icon: Sparkles, badge: `${architectureProjects.length} Projetos` },
    {
      id: 'deadlines',
      label: 'Prazos & Cobranças',
      icon: Clock,
      badge: totalDeadlinesAlerts > 0 ? `${totalDeadlinesAlerts} Alertas` : undefined,
      alertBadge: overdueInstallments.length > 0 || dueSoonInstallments.length > 0,
    },
    { id: 'overview', label: 'Painel Financeiro', icon: TrendingUp },
    { id: 'freelance', label: 'Clientes & Obras', icon: Briefcase },
    { id: 'transactions', label: 'Transações', icon: CreditCard },
    { id: 'map', label: 'Mapa Mundi & Brasil', icon: Globe, badge: 'Global' },
    { id: 'banks', label: 'Bancos & Caixa', icon: Wallet },
    { id: 'mortgage', label: 'Financiamento & Dívidas', icon: Building2 },
    { id: 'goals', label: 'Metas do Escritório', icon: Target },
    { id: 'budget', label: 'Orçamento', icon: PieChart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#14110f]/95 backdrop-blur-md border-b border-[#3d342f]">
      {/* Top Banner & Balance Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-4 border-b border-[#3d342f]">
          {/* Logo & Identity - Laíne Paula Arquiteta */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-full p-0.5 shadow-md flex items-center justify-center overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))',
                }}
              >
                {architectProfile?.photoUrl ? (
                  <img
                    src={architectProfile.photoUrl}
                    alt={architectProfile.name || 'Laíne Paula'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-[#1c1815] rounded-full flex items-center justify-center font-serif font-bold text-base transition-colors"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    LP
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-lg text-[#fcf8f5] font-serif tracking-tight transition-colors"
                  >
                    {architectProfile?.name || 'Profissional'}
                  </span>
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--theme-badge-bg)',
                      color: 'var(--theme-badge-text)',
                      border: '1px solid var(--theme-badge-border)',
                    }}
                  >
                    Pro
                  </span>
                </div>
                <p className="text-xs text-[#a89c93]">
                  {architectProfile?.title || 'Arquitetura & Design'}
                </p>
              </div>
            </button>

            {/* Mobile Action Button */}
            <button
              onClick={onOpenNewTxModal}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full text-black font-bold transition-colors shadow-sm"
              style={{
                backgroundColor: 'var(--theme-primary)',
              }}
              title="Novo Lançamento"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Balance Widgets & Month Selector */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-end">
            {/* Month Picker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c1815] border border-[#3d342f] text-[#a89c93] text-xs">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="bg-transparent text-[#fcf8f5] text-xs font-medium focus:outline-none cursor-pointer"
              />
            </div>

            {/* Dinheiro Físico (Espécie) Quick Badge */}
            <button
              onClick={() => setActiveTab('banks')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1c1815] border border-[#3d342f] hover:border-[var(--theme-primary)]/40 transition-all text-left group cursor-pointer"
              title="Ver Saldo em Dinheiro Físico / Cofre"
            >
              <Banknote className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
              <div>
                <span className="text-[10px] text-[#a89c93] block leading-tight font-medium">Caixa / Cofre:</span>
                <span className="text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>{formatCurrency(totalPhysicalCash)}</span>
              </div>
            </button>

            {/* Total Net Worth Quick Badge */}
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1c1815] border border-[#3d342f] hover:border-[var(--theme-accent)]/40 transition-all text-left cursor-pointer"
              title="Saldo Geral & Patrimônio"
            >
              <Wallet className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
              <div>
                <span className="text-[10px] text-[#a89c93] block leading-tight font-medium">Saldo Total:</span>
                <span className="text-xs font-bold text-emerald-400">{formatCurrency(totalNetWorth)}</span>
              </div>
            </button>

            {/* New Transaction Button */}
            <button
              id="header-new-tx-btn"
              onClick={onOpenNewTxModal}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
              style={{
                backgroundColor: 'var(--theme-badge-bg)',
                color: 'var(--theme-badge-text)',
                border: '1px solid var(--theme-badge-border)',
              }}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Novo Lançamento</span>
            </button>
            
            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1c1815] hover:bg-[#3d342f] text-[#a89c93] hover:text-[#fcf8f5] border border-[#3d342f] transition-colors cursor-pointer"
              title="Configurações & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Admin Panel Link */}
            <a
              href="/admin"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1c1815] hover:bg-[#3d342f] text-[#a89c93] hover:text-[var(--theme-primary)] border border-[#3d342f] transition-colors cursor-pointer"
              title="Painel Admin / Assinantes"
            >
              <ShieldCheck className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1.5 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#241e1b] border shadow-sm font-semibold'
                    : 'text-[#a89c93] hover:text-[#fcf8f5] hover:bg-[#1c1815]'
                }`}
                style={
                  isActive
                    ? {
                        color: 'var(--theme-primary)',
                        borderColor: 'rgba(var(--theme-primary-rgb), 0.45)',
                      }
                    : undefined
                }
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? 'var(--theme-primary)' : '#a89c93' }}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    style={
                      item.alertBadge
                        ? {
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            color: '#fcd34d',
                            borderColor: 'rgba(245, 158, 11, 0.4)',
                          }
                        : isActive
                        ? {
                            backgroundColor: 'var(--theme-badge-bg)',
                            color: 'var(--theme-badge-text)',
                            borderColor: 'var(--theme-badge-border)',
                          }
                        : {
                            backgroundColor: '#1c1815',
                            color: '#a89c93',
                            borderColor: '#3d342f',
                          }
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
