import React, { useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Flame,
  Home,
  MapPin,
  Palmtree,
  PartyPopper,
  Percent,
  PiggyBank,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthYear, formatPercent } from '../../utils/formatters';
import { BrazilInteractiveMap } from '../map/BrazilInteractiveMap';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewTxModal: (initialType?: 'income' | 'expense', sourceOrCat?: string) => void;
  onOpenAmortizationModal: () => void;
  onOpenCashModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  onNavigateTab,
  onOpenNewTxModal,
  onOpenAmortizationModal,
  onOpenCashModal,
}) => {
  const {
    totalNetWorth,
    totalBankBalance,
    totalPhysicalCash,
    monthlyIncomeCLT,
    monthlyIncomeFreelance,
    monthlyTotalIncome,
    monthlyTotalExpense,
    monthlyExpenseCasa,
    monthlyExpenseCarro,
    monthlyExpenseLazer,
    monthlyBalance,
    houseMortgage,
    debts,
    savingsGoals,
    currentMonthTransactions,
    selectedMonth,
    statesWithJobsCount,
    payMortgageInstallment,
    payDebtInstallment,
    bankAccounts,
  } = useFinance();

  // Savings rate
  const savingsRate =
    monthlyTotalIncome > 0
      ? Math.max(0, ((monthlyTotalIncome - monthlyTotalExpense) / monthlyTotalIncome) * 100)
      : 0;

  // Mortgage progress
  const mortgagePaidPercent =
    houseMortgage.totalInstallments > 0
      ? (houseMortgage.paidInstallments / houseMortgage.totalInstallments) * 100
      : 0;

  const totalInterestSaved = houseMortgage.extraAmortizations.reduce(
    (sum, a) => sum + (a.interestSaved || 0),
    0
  );

  // Expense distribution chart data
  const expenseData = useMemo(() => {
    const categoriesMap: Record<string, { name: string; value: number; color: string }> = {
      casa: { name: 'Casa & Moradia', value: 0, color: '#6366f1' },
      carro: { name: 'Carro & Transporte', value: 0, color: '#f97316' },
      lazer: { name: 'Lazer & Estilo', value: 0, color: '#ec4899' },
      alimentacao: { name: 'Alimentação', value: 0, color: '#10b981' },
      freela_tools: { name: 'Ferramentas Freela', value: 0, color: '#8b5cf6' },
      outros: { name: 'Outros / Diversos', value: 0, color: '#64748b' },
    };

    currentMonthTransactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .forEach((t) => {
        const cat = t.category || 'outros';
        if (categoriesMap[cat]) {
          categoriesMap[cat].value += t.amount;
        } else {
          categoriesMap.outros.value += t.amount;
        }
      });

    return Object.values(categoriesMap).filter((item) => item.value > 0);
  }, [currentMonthTransactions]);

  // Income distribution data
  const incomeCLTPercent =
    monthlyTotalIncome > 0 ? (monthlyIncomeCLT / monthlyTotalIncome) * 100 : 0;
  const incomeFreelaPercent =
    monthlyTotalIncome > 0 ? (monthlyIncomeFreelance / monthlyTotalIncome) * 100 : 0;

  // Upcoming bills / debts
  const upcomingPayments = [
    {
      id: 'mortgage-bill',
      title: 'Parcela Financiamento da Casa (Caixa)',
      amount: houseMortgage.currentInstallmentValue,
      dueDate: `Dia ${houseMortgage.monthlyDueDate}`,
      category: 'casa',
      icon: Home,
      action: () => {
        const defaultAcc = bankAccounts.find((a) => a.id === 'bank-caixa')?.id || bankAccounts[0]?.id || '';
        payMortgageInstallment(defaultAcc);
      },
    },
    ...debts.map((d) => ({
      id: d.id,
      title: d.title,
      amount: d.installmentValue,
      dueDate: `Dia ${d.dueDate}`,
      category: d.category === 'veiculo' ? 'carro' : 'dividas',
      icon: d.category === 'veiculo' ? Car : CreditCard,
      action: () => {
        const defaultAcc = bankAccounts[0]?.id || '';
        payDebtInstallment(d.id, defaultAcc);
      },
    })),
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Visão Geral</h1>
          <p className="text-[#a1a1aa] text-sm">Controle CLT, Freelance e Financiamento • {formatMonthYear(selectedMonth + '-01')}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenNewTxModal('expense')}
            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-full text-xs font-semibold border border-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            + Novo Gasto
          </button>
          <button
            onClick={() => onOpenNewTxModal('income', 'freelancer')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            Lançar Freelance
          </button>
          <button
            onClick={onOpenAmortizationModal}
            className="px-4 py-2 bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] rounded-full text-xs font-semibold border border-[#27272a] transition-all cursor-pointer active:scale-95"
          >
            Amortizar Casa
          </button>
        </div>
      </header>

      {/* 4-Column KPI Stats Grid (Sleek Interface) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Freelance */}
        <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1">Receita Freelance</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#fafafa]">{formatCurrency(monthlyIncomeFreelance)}</p>
          </div>
          <p className="text-[11px] text-emerald-400 mt-3 font-medium">
            CLT: {formatCurrency(monthlyIncomeCLT)} • Total: {formatCurrency(monthlyTotalIncome)}
          </p>
        </div>

        {/* Financiamento Casa */}
        <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1">Financiamento Casa</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#fafafa]">
              {mortgagePaidPercent.toFixed(0)}% <span className="text-xs font-normal text-[#a1a1aa]">pago</span>
            </p>
          </div>
          <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, mortgagePaidPercent))}%` }}
            ></div>
          </div>
        </div>

        {/* Reserva Física */}
        <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1">Reserva Física</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-500">{formatCurrency(totalPhysicalCash)}</p>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-3 font-medium">Espécie em mãos / cofre</p>
        </div>

        {/* Meta Economia / Saldo Poupado */}
        <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1">Saldo Poupado</p>
            <p className={`text-2xl sm:text-3xl font-bold ${monthlyBalance >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {formatCurrency(monthlyBalance)}
            </p>
          </div>
          <p className="text-[11px] text-emerald-400 mt-3 font-medium">
            {savingsRate.toFixed(1)}% taxa de poupança no mês
          </p>
        </div>
      </section>

      {/* Middle Grid: Map & Sleek Bank/Category Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brazil Freelance Map Widget (2 cols) */}
        <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[#fafafa] text-base">Mapa de Atuação (Brasil)</h3>
              <p className="text-xs text-[#a1a1aa]">Distribuição de clientes e faturamento por estado</p>
            </div>
            <span className="text-[11px] bg-[#27272a] px-2.5 py-1 rounded-md text-[#a1a1aa] font-medium border border-[#3f3f46]">
              {statesWithJobsCount} Estados Atendidos
            </span>
          </div>

          <div className="flex-1 min-h-[300px]">
            <BrazilInteractiveMap isWidgetMode={true} onSelectState={() => onNavigateTab('map')} />
          </div>
        </div>

        {/* Bank Balances & Category Bars (1 col) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col gap-6">
          {/* Saldos Bancários */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#fafafa] text-sm">Saldos Bancários</h3>
              <button
                onClick={() => onNavigateTab('banks')}
                className="text-xs text-[#a1a1aa] hover:text-white transition-colors"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3.5">
              {bankAccounts.map((acc) => {
                const initials = acc.name.slice(0, 2).toUpperCase();
                return (
                  <div key={acc.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: acc.color || '#3b82f6' }}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#fafafa]">{acc.name}</p>
                        <p className="text-[10px] text-[#a1a1aa] font-mono capitalize">{acc.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-[#fafafa]">{formatCurrency(acc.balance)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categorias do Mês */}
          <div className="pt-4 border-t border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#fafafa] text-sm">Categorias do Mês</h3>
              <button
                onClick={() => onNavigateTab('budget')}
                className="text-xs text-[#a1a1aa] hover:text-white transition-colors"
              >
                Orçamento
              </button>
            </div>

            <div className="space-y-3">
              {/* Casa */}
              <div>
                <div className="flex justify-between text-[11px] text-[#a1a1aa] mb-1">
                  <span>Casa & Contas</span>
                  <span className="font-medium text-[#fafafa]">
                    {monthlyTotalExpense > 0 ? ((monthlyExpenseCasa / monthlyTotalExpense) * 100).toFixed(0) : 0}% ({formatCurrency(monthlyExpenseCasa)})
                  </span>
                </div>
                <div className="w-full bg-[#27272a] h-1.5 rounded-full">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full"
                    style={{
                      width: `${monthlyTotalExpense > 0 ? Math.min(100, (monthlyExpenseCasa / monthlyTotalExpense) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Lazer */}
              <div>
                <div className="flex justify-between text-[11px] text-[#a1a1aa] mb-1">
                  <span>Lazer & Estilo</span>
                  <span className="font-medium text-[#fafafa]">
                    {monthlyTotalExpense > 0 ? ((monthlyExpenseLazer / monthlyTotalExpense) * 100).toFixed(0) : 0}% ({formatCurrency(monthlyExpenseLazer)})
                  </span>
                </div>
                <div className="w-full bg-[#27272a] h-1.5 rounded-full">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{
                      width: `${monthlyTotalExpense > 0 ? Math.min(100, (monthlyExpenseLazer / monthlyTotalExpense) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Carro */}
              <div>
                <div className="flex justify-between text-[11px] text-[#a1a1aa] mb-1">
                  <span>Carro & Transporte</span>
                  <span className="font-medium text-[#fafafa]">
                    {monthlyTotalExpense > 0 ? ((monthlyExpenseCarro / monthlyTotalExpense) * 100).toFixed(0) : 0}% ({formatCurrency(monthlyExpenseCarro)})
                  </span>
                </div>
                <div className="w-full bg-[#27272a] h-1.5 rounded-full">
                  <div
                    className="bg-yellow-500 h-1.5 rounded-full"
                    style={{
                      width: `${monthlyTotalExpense > 0 ? Math.min(100, (monthlyExpenseCarro / monthlyTotalExpense) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Grid: House Mortgage Spotlight & Recent Transactions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* House Mortgage Spotlight (5 cols) */}
        <div className="lg:col-span-5 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#fafafa] text-sm">Financiamento da Casa</h3>
                <p className="text-[11px] text-[#a1a1aa]">{houseMortgage.bankName} • Sistema {houseMortgage.amortizationSystem}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('mortgage')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Detalhes <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a]">
              <span className="text-[11px] text-[#a1a1aa] block">Saldo Devedor Atual</span>
              <span className="text-base font-bold text-[#fafafa] block mt-0.5">
                {formatCurrency(houseMortgage.currentDebt)}
              </span>
              <span className="text-[10px] text-[#71717a] mt-1 block">
                Financiado: {formatCurrency(houseMortgage.financedAmount)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a]">
              <span className="text-[11px] text-[#a1a1aa] block">Parcela Mensal</span>
              <span className="text-base font-bold text-emerald-400 block mt-0.5">
                {formatCurrency(houseMortgage.currentInstallmentValue)}
              </span>
              <span className="text-[10px] text-blue-400 mt-1 block">
                Vence dia {houseMortgage.monthlyDueDate}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#a1a1aa]">Progresso da Quitação:</span>
              <span className="font-bold text-blue-400">
                {houseMortgage.paidInstallments} de {houseMortgage.totalInstallments} parcelas ({mortgagePaidPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${mortgagePaidPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-emerald-400 font-semibold block">Economia em Juros:</span>
              <span className="text-[11px] text-[#a1a1aa]">
                Você já economizou ~<strong className="text-emerald-400">{formatCurrency(totalInterestSaved)}</strong> em juros!
              </span>
            </div>
            <button
              onClick={onOpenAmortizationModal}
              className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] whitespace-nowrap ml-2 cursor-pointer transition-all active:scale-95"
            >
              Simular
            </button>
          </div>
        </div>

        {/* Recent Transactions (7 cols) */}
        <div className="lg:col-span-7 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#fafafa] text-sm">Últimas Movimentações</h3>
              <p className="text-[11px] text-[#a1a1aa]">Entradas CLT, Freelancer e Despesas</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Ver Extrato <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#27272a]">
            {currentMonthTransactions.slice(0, 5).map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const bank = bankAccounts.find((b) => b.id === tx.bankAccountId);

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isTransfer
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : isTransfer ? <Zap className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-[#fafafa] truncate">{tx.description}</div>
                      <div className="text-[11px] text-[#a1a1aa] flex items-center gap-2 mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{bank?.name || 'Conta'}</span>
                        {tx.clientName && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400 font-medium">Cliente: {tx.clientName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap pl-3">
                    <div
                      className={`font-bold ${
                        isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-[#fafafa]'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'} {formatCurrency(tx.amount)}
                    </div>
                    <span className="text-[10px] text-[#71717a] uppercase">{tx.paymentMethod || 'PIX'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
