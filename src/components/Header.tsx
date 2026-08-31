import React, { useState } from 'react';
import {
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  Download,
  Flame,
  Home,
  MapPin,
  PieChart,
  Plus,
  ShieldCheck,
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
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTxModal,
}) => {
  const {
    totalNetWorth,
    totalPhysicalCash,
    selectedMonth,
    setSelectedMonth,
    statesWithJobsCount,
    monthlyBalance,
  } = useFinance();

  const [year, month] = selectedMonth.split('-');

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'transactions', label: 'Transações', icon: CreditCard },
    { id: 'freelance', label: 'Freelancer & Clientes', icon: Briefcase },
    { id: 'map', label: 'Mapa do Brasil', icon: MapPin, badge: `${statesWithJobsCount} UFs` },
    { id: 'mortgage', label: 'Financiamento & Dívidas', icon: Building2 },
    { id: 'banks', label: 'Bancos & Dinheiro', icon: Wallet },
    { id: 'goals', label: 'Metas & Poupança', icon: Target },
    { id: 'budget', label: 'Orçamento', icon: PieChart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a]">
      {/* Top Banner & Balance Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-4 border-b border-[#27272a]">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black text-base shadow-sm">
                $
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-[#fafafa] tracking-tight">FinanceHub</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-[#a1a1aa]">Controle CLT, Freelance e Financiamento</p>
              </div>
            </div>

            {/* Mobile Action Button */}
            <button
              onClick={onOpenNewTxModal}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors shadow-sm"
              title="Novo Lançamento"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Balance Widgets & Month Selector */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-end">
            {/* Month Picker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#a1a1aa]" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="bg-transparent text-[#fafafa] text-xs font-medium focus:outline-none cursor-pointer"
              />
            </div>

            {/* Dinheiro Físico (Espécie) Quick Badge */}
            <button
              onClick={() => setActiveTab('banks')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-yellow-500/30 transition-all text-left group"
              title="Ver Saldo em Dinheiro Físico / Cofre"
            >
              <Banknote className="w-3.5 h-3.5 text-yellow-500" />
              <div>
                <span className="text-[10px] text-[#a1a1aa] block leading-tight font-medium">Reserva Física:</span>
                <span className="text-xs font-bold text-yellow-500">{formatCurrency(totalPhysicalCash)}</span>
              </div>
            </button>

            {/* Total Net Worth Quick Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a]">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <span className="text-[10px] text-[#a1a1aa] block leading-tight font-medium">Saldo Total:</span>
                <span className="text-xs font-bold text-emerald-400">{formatCurrency(totalNetWorth)}</span>
              </div>
            </div>

            {/* New Transaction Button (Desktop - Sleek Pill) */}
            <button
              id="header-new-tx-btn"
              onClick={onOpenNewTxModal}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-full text-xs font-semibold border border-emerald-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Novo Gasto</span>
            </button>
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#18181b] text-emerald-400 border border-[#27272a] shadow-sm'
                    : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#a1a1aa]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]">
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
