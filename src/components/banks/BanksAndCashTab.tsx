import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  Edit2,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Vault,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { BankAccount } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface BanksAndCashTabProps {
  onOpenTransferModal: () => void;
  onOpenCashModal: () => void;
}

export const BanksAndCashTab: React.FC<BanksAndCashTabProps> = ({
  onOpenTransferModal,
  onOpenCashModal,
}) => {
  const {
    bankAccounts,
    totalNetWorth,
    totalBankBalance,
    totalPhysicalCash,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    transactions,
  } = useFinance();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [accountType, setAccountType] = useState<'bank' | 'fintech' | 'investment' | 'physical_cash'>('bank');
  const [color, setColor] = useState('#820ad1');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setBalance('');
    setAccountType('bank');
    setColor('#820ad1');
    setAccountNumber('');
    setBankCode('');
    setIsAddAccountOpen(true);
  };

  const handleOpenEdit = (acc: BankAccount) => {
    setEditingAccount(acc);
    setName(acc.name);
    setBalance(acc.balance.toString());
    setAccountType(acc.type);
    setColor(acc.color);
    setAccountNumber(acc.accountNumber || '');
    setBankCode(acc.bankCode || '');
    setIsAddAccountOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance.replace(',', '.')) || 0;

    if (!name.trim()) return;

    if (editingAccount) {
      updateBankAccount(editingAccount.id, {
        name,
        balance: numBalance,
        type: accountType,
        color,
        accountNumber,
        bankCode,
      });
    } else {
      addBankAccount({
        name,
        balance: numBalance,
        type: accountType,
        color,
        iconName: accountType === 'physical_cash' ? 'Banknote' : 'Building2',
        accountNumber,
        bankCode,
      });
    }

    setIsAddAccountOpen(false);
  };

  // Physical cash transactions
  const cashTransactions = transactions
    .filter(
      (t) =>
        t.bankAccountId === 'cash-wallet' ||
        t.toBankAccountId === 'cash-wallet' ||
        t.paymentMethod === 'dinheiro_vivo'
    )
    .slice(0, 8);

  const regularBanks = bankAccounts.filter((a) => a.type !== 'physical_cash' && a.id !== 'cash-wallet');
  const physicalCashAcc = bankAccounts.find((a) => a.type === 'physical_cash' || a.id === 'cash-wallet');

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Contas Bancárias & Dinheiro Físico em Espécie
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Cadastre seus bancos (Nubank, Itaú, Inter, Caixa, etc.) e gerencie sua reserva de dinheiro físico no cofre de casa.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-semibold border border-[#3f3f46] transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <span>Transferir entre Contas</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Banco</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a1a1aa] font-medium">Patrimônio Consolidado</span>
            <div className="text-xl sm:text-2xl font-bold text-[#fafafa] mt-1">
              {formatCurrency(totalNetWorth)}
            </div>
            <span className="text-[11px] text-[#71717a]">Soma de todos os saldos</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a1a1aa] font-medium">Saldos nos Bancos</span>
            <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">
              {formatCurrency(totalBankBalance)}
            </div>
            <span className="text-[11px] text-[#71717a]">{regularBanks.length} contas cadastradas</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a1a1aa] font-medium">Dinheiro Físico (Cofre/Espécie)</span>
            <div className="text-xl sm:text-2xl font-bold text-yellow-500 mt-1">
              {formatCurrency(totalPhysicalCash)}
            </div>
            <span className="text-[11px] text-yellow-500/80">Guardado fisicamente</span>
          </div>
          <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            <Banknote className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SPECIAL SECTION: DINHEIRO FÍSICO / COFRE EM ESPÉCIE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#27272a] relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#fafafa] tracking-tight">
                  Dinheiro Físico / Cofre & Carteira em Espécie
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Reserva em Casa
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Controle exclusivo para guardar e movimentar notas de dinheiro vivo, saques e depósitos físicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCashModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guardar / Gastar Espécie</span>
            </button>
          </div>
        </div>

        {/* Cash Balance Display & Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 p-4 rounded-xl bg-[#09090b] border border-[#27272a] relative group">
            <div className="flex items-start justify-between">
              <span className="text-[11px] text-[#a1a1aa] block">Saldo Atual em Dinheiro Físico</span>
              {physicalCashAcc && (
                <button
                  onClick={() => handleOpenEdit(physicalCashAcc)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] transition-all cursor-pointer"
                  title="Editar Saldo Total"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-3xl font-bold text-yellow-500 mt-1">
              {formatCurrency(totalPhysicalCash)}
            </div>
            <p className="text-[11px] text-[#71717a] mt-2">
              Disponível em mãos para compras com desconto ou emergências.
            </p>
          </div>

          {/* Recent Cash Transactions */}
          <div className="md:col-span-8 p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#fafafa] uppercase tracking-wider">
                Histórico Recente em Dinheiro Vivo
              </span>
              <span className="text-[11px] text-[#71717a]">Últimas entradas/saídas</span>
            </div>

            {cashTransactions.length > 0 ? (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 text-xs">
                {cashTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-[#fafafa] truncate">{tx.description}</div>
                      <div className="text-[10px] text-[#71717a]">{formatDate(tx.date)}</div>
                    </div>
                    <div
                      className={`font-bold whitespace-nowrap ${
                        tx.type === 'income' || tx.toBankAccountId === 'cash-wallet'
                          ? 'text-emerald-400'
                          : 'text-yellow-500'
                      }`}
                    >
                      {tx.type === 'income' || tx.toBankAccountId === 'cash-wallet' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#71717a]">
                Nenhuma movimentação em dinheiro físico registrada ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-wider">
            Contas Bancárias Cadastradas ({regularBanks.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularBanks.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Colored subtle glow accent on top */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: acc.color }}
              />

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm"
                      style={{ backgroundColor: acc.color, color: acc.textColor || '#fff' }}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#fafafa] text-sm">{acc.name}</h4>
                      <p className="text-[11px] text-[#a1a1aa]">
                        {acc.type === 'fintech' ? 'Fintech / Digital' : acc.type === 'investment' ? 'Investimento' : 'Banco Tradicional'}
                        {acc.bankCode ? ` • Banco ${acc.bankCode}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] transition-colors cursor-pointer"
                      title="Editar Conta"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBankAccount(acc.id)}
                      className="p-1.5 rounded-lg bg-[#27272a] hover:bg-rose-500/20 text-[#a1a1aa] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remover Conta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {acc.accountNumber && (
                  <div className="text-[11px] font-mono text-[#a1a1aa] bg-[#09090b] px-2.5 py-1 rounded-lg border border-[#27272a]">
                    Conta: {acc.accountNumber}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-[#27272a] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase tracking-wider block">Saldo Atual</span>
                  <span className="text-lg font-bold text-[#fafafa] block mt-0.5">
                    {formatCurrency(acc.balance)}
                  </span>
                </div>

                {acc.isDefault && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Principal
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#18181b] border border-[#27272a] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#fafafa]">
              {editingAccount ? 'Editar Conta Bancária' : 'Cadastrar Nova Conta Bancária'}
            </h3>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Nome do Banco / Conta *</label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, Itaú, Inter, Bradesco..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Saldo Atual (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Tipo de Conta</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="bank">Banco Tradicional</option>
                    <option value="fintech">Fintech / Digital</option>
                    <option value="investment">Investimento / Reserva</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Cor do Banco</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <span className="font-mono text-[#a1a1aa] text-[11px]">{color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Código / Agência (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 260 ou 0001"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Número da Conta (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 12345-6"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors cursor-pointer"
                >
                  {editingAccount ? 'Salvar Alterações' : 'Cadastrar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
