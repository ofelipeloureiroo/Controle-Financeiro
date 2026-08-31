import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Filter,
  Home,
  MapPin,
  PartyPopper,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory, IncomeSource, Transaction, TransactionType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionsTabProps {
  onOpenNewTxModal: (initialType?: 'income' | 'expense', sourceOrCat?: string) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ onOpenNewTxModal }) => {
  const {
    transactions,
    bankAccounts,
    selectedMonth,
    deleteTransaction,
    updateTransaction,
    exportTransactionsCSV,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all'); // all, income_clt, income_freela, expense_casa, expense_carro, expense_lazer, transfer, cash
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Month filter (if date is within selectedMonth or all)
      if (selectedMonth && !t.date.startsWith(selectedMonth)) {
        // Only if not searching explicitly across all
        if (!searchTerm) return false;
      }

      // Type filter
      if (filterType === 'income_clt' && (t.type !== 'income' || t.incomeSource !== 'clt')) return false;
      if (filterType === 'income_freela' && (t.type !== 'income' || t.incomeSource !== 'freelancer')) return false;
      if (filterType === 'expense_casa' && (t.type !== 'expense' || (t.category !== 'casa' && t.category !== 'financiamento'))) return false;
      if (filterType === 'expense_carro' && (t.type !== 'expense' || t.category !== 'carro')) return false;
      if (filterType === 'expense_lazer' && (t.type !== 'expense' || t.category !== 'lazer')) return false;
      if (filterType === 'transfer' && t.type !== 'transfer') return false;
      if (filterType === 'cash' && t.bankAccountId !== 'cash-wallet' && t.toBankAccountId !== 'cash-wallet') return false;

      // Account filter
      if (filterAccount !== 'all' && t.bankAccountId !== filterAccount && t.toBankAccountId !== filterAccount) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;

      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(term);
        const matchesClient = t.clientName?.toLowerCase().includes(term);
        const matchesNotes = t.notes?.toLowerCase().includes(term);
        if (!matchesDesc && !matchesClient && !matchesNotes) return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, filterType, filterAccount, filterStatus, searchTerm]);

  // Statistics for the filtered view
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const getCategoryBadge = (tx: Transaction) => {
    if (tx.type === 'income') {
      if (tx.incomeSource === 'clt') {
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Salário CLT
          </span>
        );
      }
      if (tx.incomeSource === 'freelancer') {
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Freelancer
          </span>
        );
      }
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Entrada
        </span>
      );
    }

    if (tx.type === 'transfer') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
          <Zap className="w-3 h-3" /> Transferência
        </span>
      );
    }

    // Expense categories
    switch (tx.category) {
      case 'casa':
      case 'financiamento':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
            <Home className="w-3 h-3" /> Casa / Moradia
          </span>
        );
      case 'carro':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
            <Car className="w-3 h-3" /> Carro / Transporte
          </span>
        );
      case 'lazer':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center gap-1">
            <PartyPopper className="w-3 h-3" /> Lazer & Estilo
          </span>
        );
      case 'alimentacao':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" /> Alimentação
          </span>
        );
      case 'freela_tools':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Freela Tools / MEI
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            Outros
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Extrato de Transações & Movimentações
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Registro detalhado de tudo que entra e sai da conta (CLT, Freela, Casa, Carro, Lazer e Dinheiro Físico).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportTransactionsCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-semibold border border-[#3f3f46] transition-colors cursor-pointer"
            title="Exportar dados para planilha Excel (.csv)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Planilha (CSV)</span>
          </button>

          <button
            onClick={() => onOpenNewTxModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Financial Stats of Current Filtered View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#a1a1aa] block uppercase font-medium">Total Entradas</span>
              <span className="text-base font-bold text-emerald-400">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#a1a1aa] block uppercase font-medium">Total Saídas</span>
              <span className="text-base font-bold text-rose-400">
                {formatCurrency(totalExpense)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#a1a1aa] block uppercase font-medium">Resultado do Período</span>
              <span className={`text-base font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição, cliente, notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Account Filter */}
          <div className="sm:col-span-3">
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Todos os Bancos & Cofre</option>
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="completed">Concluídos / Pagos</option>
              <option value="pending">Pendentes / A Vencer</option>
            </select>
          </div>
        </div>

        {/* Quick Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] text-[#a1a1aa] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtro rápido:
          </span>

          {[
            { id: 'all', label: 'Tudo' },
            { id: 'income_clt', label: '💼 Salário CLT' },
            { id: 'income_freela', label: '🚀 Freelancer' },
            { id: 'expense_casa', label: '🏠 Casa & Moradia' },
            { id: 'expense_carro', label: '🚗 Carro' },
            { id: 'expense_lazer', label: '🌴 Lazer' },
            { id: 'cash', label: '💵 Dinheiro Físico' },
            { id: 'transfer', label: '⚡ Transferências' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-xs font-medium cursor-pointer ${
                filterType === pill.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#09090b] text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-[#27272a]">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const bank = bankAccounts.find((b) => b.id === tx.bankAccountId);
              const toBank = tx.toBankAccountId ? bankAccounts.find((b) => b.id === tx.toBankAccountId) : null;

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-[#27272a]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isTransfer
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : isTransfer ? <Zap className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#fafafa] text-sm">{tx.description}</span>
                        {getCategoryBadge(tx)}
                        {tx.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#a1a1aa] flex-wrap">
                        <span className="flex items-center gap-1 text-[#a1a1aa] font-mono">
                          <Calendar className="w-3 h-3 text-[#71717a]" />
                          {formatDate(tx.date)}
                        </span>
                        <span>•</span>
                        <span className="text-[#fafafa]">
                          {bank?.name || 'Conta'}
                          {toBank ? ` ➔ ${toBank.name}` : ''}
                        </span>
                        {tx.clientName && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400 font-semibold flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> Cliente: {tx.clientName}
                            </span>
                          </>
                        )}
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="text-[#71717a] italic max-w-xs truncate">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div
                        className={`text-sm sm:text-base font-bold ${
                          isIncome
                            ? 'text-emerald-400'
                            : isTransfer
                            ? 'text-blue-400'
                            : 'text-[#fafafa]'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'} {formatCurrency(tx.amount)}
                      </div>
                      <span className="text-[10px] text-[#71717a] uppercase tracking-wider block">
                        {tx.paymentMethod ? tx.paymentMethod.replace('_', ' ') : 'PIX'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {tx.status === 'pending' && (
                        <button
                          onClick={() => updateTransaction(tx.id, { status: 'completed' })}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                          title="Marcar como Pago / Concluído"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 rounded-lg bg-[#27272a] hover:bg-rose-500/20 text-[#a1a1aa] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-[#71717a] space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-[#71717a]" />
            <p className="text-sm text-[#a1a1aa] font-medium">Nenhum lançamento encontrado para os filtros selecionados.</p>
            <p className="text-xs text-[#71717a]">Tente ajustar o mês de referência ou limpar o campo de busca.</p>
          </div>
        )}
      </div>
    </div>
  );
};
