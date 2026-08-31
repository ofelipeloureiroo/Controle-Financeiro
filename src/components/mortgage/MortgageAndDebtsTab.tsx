import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowDownRight,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Edit2,
  Flame,
  HelpCircle,
  History,
  Home,
  Percent,
  Plus,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Debt, ExtraAmortization } from '../../types';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  simulateMortgageAmortization,
} from '../../utils/formatters';

interface MortgageAndDebtsTabProps {
  onOpenAmortizationModal: () => void;
}

export const MortgageAndDebtsTab: React.FC<MortgageAndDebtsTabProps> = ({
  onOpenAmortizationModal,
}) => {
  const {
    houseMortgage,
    debts,
    bankAccounts,
    updateMortgage,
    payMortgageInstallment,
    applyMortgageAmortization,
    addDebt,
    updateDebt,
    deleteDebt,
    payDebtInstallment,
  } = useFinance();

  // Interactive Live Simulator State
  const [simAmount, setSimAmount] = useState<number>(5000);
  const [simType, setSimType] = useState<'prazo' | 'prestacao'>('prazo');
  const [selectedSourceAccount, setSelectedSourceAccount] = useState<string>(
    bankAccounts[0]?.id || 'bank-nubank'
  );

  // Edit Mortgage Modal
  const [isEditMortgageOpen, setIsEditMortgageOpen] = useState(false);
  const [mortgageBank, setMortgageBank] = useState(houseMortgage.bankName);
  const [mortgageProperty, setMortgageProperty] = useState(houseMortgage.propertyName);
  const [mortgageDebt, setMortgageDebt] = useState(houseMortgage.currentDebt.toString());
  const [mortgageInstallments, setMortgageInstallments] = useState(
    houseMortgage.totalInstallments.toString()
  );
  const [mortgagePaid, setMortgagePaid] = useState(houseMortgage.paidInstallments.toString());
  const [mortgageInstallmentVal, setMortgageInstallmentVal] = useState(
    houseMortgage.currentInstallmentValue.toString()
  );
  const [mortgageRate, setMortgageRate] = useState(houseMortgage.annualInterestRate.toString());
  const [mortgageSystem, setMortgageSystem] = useState<'SAC' | 'PRICE'>(
    houseMortgage.amortizationSystem
  );
  const [mortgageDueDay, setMortgageDueDay] = useState(houseMortgage.monthlyDueDate.toString());

  // Add Debt Modal
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [debtTitle, setDebtTitle] = useState('');
  const [debtCategory, setDebtCategory] = useState<'cartao' | 'emprestimo' | 'veiculo' | 'consignado' | 'outro'>('veiculo');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtRemaining, setDebtRemaining] = useState('');
  const [debtInstallmentVal, setDebtInstallmentVal] = useState('');
  const [debtTotalInst, setDebtTotalInst] = useState('');
  const [debtPaidInst, setDebtPaidInst] = useState('');
  const [debtDueDay, setDebtDueDay] = useState('15');
  const [debtCreditor, setDebtCreditor] = useState('');

  // Calculations
  const remainingInstallments = Math.max(
    0,
    houseMortgage.totalInstallments - houseMortgage.paidInstallments
  );
  const progressPercent =
    houseMortgage.totalInstallments > 0
      ? (houseMortgage.paidInstallments / houseMortgage.totalInstallments) * 100
      : 0;

  const totalInterestSavedSoFar = houseMortgage.extraAmortizations.reduce(
    (acc, cur) => acc + (cur.interestSaved || 0),
    0
  );

  const totalMonthsReducedSoFar = houseMortgage.extraAmortizations.reduce(
    (acc, cur) => acc + (cur.monthsReduced || 0),
    0
  );

  // Live simulation output
  const simResult = useMemo(() => {
    return simulateMortgageAmortization(
      houseMortgage.currentDebt,
      remainingInstallments,
      houseMortgage.annualInterestRate,
      simAmount,
      simType
    );
  }, [houseMortgage, remainingInstallments, simAmount, simType]);

  const handleApplySimulatedAmortization = () => {
    if (simAmount <= 0) return;

    applyMortgageAmortization(
      simAmount,
      simType,
      selectedSourceAccount,
      `Amortização simulada no painel (${simType === 'prazo' ? 'Redução de prazo' : 'Redução de prestação'})`
    );

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleSaveMortgage = (e: React.FormEvent) => {
    e.preventDefault();
    updateMortgage({
      bankName: mortgageBank,
      propertyName: mortgageProperty,
      currentDebt: parseFloat(mortgageDebt.replace(',', '.')) || 0,
      totalInstallments: parseInt(mortgageInstallments, 10) || 360,
      paidInstallments: parseInt(mortgagePaid, 10) || 0,
      currentInstallmentValue: parseFloat(mortgageInstallmentVal.replace(',', '.')) || 0,
      annualInterestRate: parseFloat(mortgageRate.replace(',', '.')) || 9.5,
      amortizationSystem: mortgageSystem,
      monthlyDueDate: parseInt(mortgageDueDay, 10) || 10,
    });
    setIsEditMortgageOpen(false);
  };

  const handleOpenAddDebt = () => {
    setEditingDebt(null);
    setDebtTitle('');
    setDebtCategory('veiculo');
    setDebtTotal('');
    setDebtRemaining('');
    setDebtInstallmentVal('');
    setDebtTotalInst('48');
    setDebtPaidInst('0');
    setDebtDueDay('15');
    setDebtCreditor('');
    setIsAddDebtOpen(true);
  };

  const handleOpenEditDebt = (d: Debt) => {
    setEditingDebt(d);
    setDebtTitle(d.title);
    setDebtCategory(d.category);
    setDebtTotal(d.totalAmount.toString());
    setDebtRemaining(d.remainingAmount.toString());
    setDebtInstallmentVal(d.installmentValue.toString());
    setDebtTotalInst(d.totalInstallments.toString());
    setDebtPaidInst(d.paidInstallments.toString());
    setDebtDueDay(d.dueDate.toString());
    setDebtCreditor(d.creditor);
    setIsAddDebtOpen(true);
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(debtTotal.replace(',', '.')) || 0;
    const rem = parseFloat(debtRemaining.replace(',', '.')) || tot;
    const inst = parseFloat(debtInstallmentVal.replace(',', '.')) || 0;
    const totInst = parseInt(debtTotalInst, 10) || 1;
    const paidInst = parseInt(debtPaidInst, 10) || 0;
    const due = parseInt(debtDueDay, 10) || 15;

    if (editingDebt) {
      updateDebt(editingDebt.id, {
        title: debtTitle,
        category: debtCategory,
        totalAmount: tot,
        remainingAmount: rem,
        installmentValue: inst,
        totalInstallments: totInst,
        paidInstallments: paidInst,
        dueDate: due,
        creditor: debtCreditor,
      });
    } else {
      addDebt({
        title: debtTitle,
        category: debtCategory,
        totalAmount: tot,
        remainingAmount: rem,
        installmentValue: inst,
        totalInstallments: totInst,
        paidInstallments: paidInst,
        dueDate: due,
        creditor: debtCreditor,
      });
    }
    setIsAddDebtOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Home className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-[#fafafa] tracking-tight">
              Financiamento da Casa & Quitação de Dívidas
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1 max-w-2xl">
            Acompanhe o saldo devedor do imóvel, simule abatimentos extraordinários com lucro do Freelancer
            e veja o impacto real na redução de anos e milhares de reais em juros!
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsEditMortgageOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-semibold border border-[#3f3f46] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar Parâmetros da Casa</span>
          </button>
        </div>
      </div>

      {/* BIG SPOTLIGHT: FINANCIAMENTO IMOBILIÁRIO (CASA PRÓPRIA) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-6 relative overflow-hidden">
        {/* Top Header of the Mortgage */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#fafafa] tracking-tight">
                  {houseMortgage.propertyName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {houseMortgage.bankName}
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Sistema de Amortização {houseMortgage.amortizationSystem} • Taxa de Juros: {formatPercent(houseMortgage.annualInterestRate)} a.a. • Vencimento todo dia {houseMortgage.monthlyDueDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const defaultAcc = bankAccounts.find((a) => a.id === 'bank-caixa')?.id || bankAccounts[0]?.id || '';
                payMortgageInstallment(defaultAcc);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-semibold border border-[#3f3f46] transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pagar Parcela Mensal ({formatCurrency(houseMortgage.currentInstallmentValue)})</span>
            </button>
          </div>
        </div>

        {/* 4 Main Metrics of the Mortgage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a]">
            <span className="text-[11px] text-[#a1a1aa] font-medium block">Saldo Devedor Atual</span>
            <div className="text-2xl font-bold text-[#fafafa] mt-1">
              {formatCurrency(houseMortgage.currentDebt)}
            </div>
            <span className="text-[10px] text-[#71717a] mt-1 block">
              Original: {formatCurrency(houseMortgage.financedAmount)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a]">
            <span className="text-[11px] text-[#a1a1aa] font-medium block">Parcela Mensal Atual</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(houseMortgage.currentInstallmentValue)}
            </div>
            <span className="text-[10px] text-blue-400 mt-1 block">
              Reduz todo mês no sistema SAC
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a]">
            <span className="text-[11px] text-[#a1a1aa] font-medium block">Parcelas Restantes</span>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {remainingInstallments} meses
            </div>
            <span className="text-[10px] text-[#71717a] mt-1 block">
              {houseMortgage.paidInstallments} pagas de {houseMortgage.totalInstallments} ({progressPercent.toFixed(1)}%)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-400 font-semibold block">Total Juros Economizados</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(totalInterestSavedSoFar)}
            </div>
            <span className="text-[10px] text-emerald-400/80 mt-1 block">
              {totalMonthsReducedSoFar} meses eliminados via amortização extra
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#fafafa]">Progresso Geral da Quitação:</span>
            <span className="font-mono text-emerald-400 font-bold">
              {houseMortgage.paidInstallments} de {houseMortgage.totalInstallments} pagas ({progressPercent.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#09090b] rounded-full overflow-hidden p-0.5 border border-[#27272a]">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* INTERACTIVE AMORTIZATION SIMULATOR BOX */}
        <div className="p-5 rounded-2xl bg-[#09090b] border border-[#27272a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <h4 className="font-bold text-[#fafafa] text-sm">
                Simulador Interativo de Amortização Extraordinária
              </h4>
            </div>
            <span className="text-[11px] text-[#a1a1aa] font-medium">
              Calcule quanto tempo e juros você poupa ao abater valores
            </span>
          </div>

          {/* Value Buttons & Custom Input */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6 space-y-3">
              <label className="block text-xs text-[#a1a1aa] font-medium">
                Valor que deseja abater da dívida (R$):
              </label>

              {/* Quick Pills */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {[1000, 2500, 5000, 10000, 20000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSimAmount(val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      simAmount === val
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#18181b] text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a]'
                    }`}
                  >
                    + {formatCurrency(val)}
                  </button>
                ))}
              </div>

              {/* Manual Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] text-xs font-bold">
                  R$
                </span>
                <input
                  type="number"
                  step="100"
                  value={simAmount}
                  onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-[#fafafa] text-sm font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Amortization Type Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSimType('prazo')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    simType === 'prazo'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]'
                  }`}
                >
                  ⚡ Reduzir Prazo (Eliminar Anos)
                </button>
                <button
                  type="button"
                  onClick={() => setSimType('prestacao')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    simType === 'prestacao'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]'
                  }`}
                >
                  📉 Reduzir Prestação (Parcela Menor)
                </button>
              </div>
            </div>

            {/* Simulation Results Card */}
            <div className="md:col-span-6 p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
              <div className="text-xs font-bold text-[#fafafa] uppercase tracking-wider flex items-center justify-between border-b border-[#27272a] pb-2">
                <span>Resultado da Simulação</span>
                <span className="text-emerald-400 lowercase font-normal">cálculo em tempo real</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {simType === 'prazo' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Tempo eliminado da dívida:</span>
                      <span className="text-sm font-bold text-blue-400">
                        - {simResult.reducedMonths} meses (~{(simResult.reducedMonths / 12).toFixed(1)} anos)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Economia estimada em juros:</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {formatCurrency(simResult.estimatedInterestSaved)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Nova data prevista de quitação:</span>
                      <span className="font-semibold text-[#fafafa]">
                        {simResult.newPayoffDateEstimate}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Nova parcela mensal estimada:</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {formatCurrency(simResult.newInstallmentValue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Redução na prestação:</span>
                      <span className="font-bold text-blue-400">
                        - {formatCurrency(Math.max(0, houseMortgage.currentInstallmentValue - simResult.newInstallmentValue))} /mês
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Button to Execute Amortization */}
              <div className="pt-2 border-t border-[#27272a] flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedSourceAccount}
                  onChange={(e) => setSelectedSourceAccount(e.target.value)}
                  className="w-full sm:w-1/2 px-3 py-2 rounded-full bg-[#09090b] border border-[#27272a] text-[11px] text-[#fafafa] cursor-pointer"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      Debitar de: {b.name} ({formatCurrency(b.balance)})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleApplySimulatedAmortization}
                  className="w-full sm:w-1/2 py-2 px-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all active:scale-95 shadow-sm whitespace-nowrap cursor-pointer"
                >
                  Efetivar Amortização Agora
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Past Extra Amortizations History */}
        {houseMortgage.extraAmortizations.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#a1a1aa]" />
              Histórico de Amortizações Extraordinárias Realizadas
            </h4>

            <div className="divide-y divide-[#27272a] border border-[#27272a] rounded-xl overflow-hidden bg-[#09090b]">
              {houseMortgage.extraAmortizations.map((item) => (
                <div
                  key={item.id}
                  className="p-3 flex items-center justify-between text-xs hover:bg-[#18181b] transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#fafafa]">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.type === 'prazo' ? `-${item.monthsReduced || 0} meses eliminados` : 'Redução de prestação'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#71717a]">
                      {formatDate(item.date)} {item.notes ? `• ${item.notes}` : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-emerald-400 font-bold block">
                      Economizou ~{formatCurrency(item.interestSaved || 0)} em juros
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OTHER DEBTS SECTION (CAR, CREDIT CARDS, LOANS) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-yellow-500" />
              Outras Dívidas & Financiamentos (Carro, Cartões, Empréstimos)
            </h3>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Organização para quitar todas as suas dívidas e manter a vida financeira limpa.
            </p>
          </div>

          <button
            onClick={handleOpenAddDebt}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Outra Dívida</span>
          </button>
        </div>

        {/* Debts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debts.map((d) => {
            const debtProgress =
              d.totalInstallments > 0 ? (d.paidInstallments / d.totalInstallments) * 100 : 0;

            return (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-[#09090b] border border-[#27272a] space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                        {d.category === 'veiculo'
                          ? 'Financiamento Veículo'
                          : d.category === 'cartao'
                          ? 'Cartão Parcelado'
                          : 'Empréstimo'}
                      </span>
                      <h4 className="text-sm font-bold text-[#fafafa] mt-1.5">{d.title}</h4>
                      <p className="text-[11px] text-[#a1a1aa]">Credor: {d.creditor}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDebt(d)}
                        className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteDebt(d.id)}
                        className="p-1.5 rounded-lg bg-[#18181b] hover:bg-rose-500/20 text-[#a1a1aa] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
                      <span className="text-[10px] text-[#71717a] block">Saldo Restante</span>
                      <span className="font-bold text-[#fafafa] text-sm">
                        {formatCurrency(d.remainingAmount)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
                      <span className="text-[10px] text-[#71717a] block">Parcela Mensal</span>
                      <span className="font-bold text-yellow-500 text-sm">
                        {formatCurrency(d.installmentValue)}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#a1a1aa]">
                        {d.paidInstallments} de {d.totalInstallments} parcelas pagas
                      </span>
                      <span className="font-bold text-yellow-500">{debtProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#18181b] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                        style={{ width: `${debtProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#27272a] flex items-center justify-between">
                  <span className="text-[11px] text-[#a1a1aa]">Vence dia {d.dueDate}</span>
                  <button
                    onClick={() => {
                      const acc = bankAccounts[0]?.id || '';
                      payDebtInstallment(d.id, acc);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Pagar Parcela ({formatCurrency(d.installmentValue)})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Mortgage Modal */}
      {isEditMortgageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#18181b] border border-[#27272a] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#fafafa]">
              Configurações do Financiamento da Casa
            </h3>

            <form onSubmit={handleSaveMortgage} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Banco Financiador</label>
                  <input
                    type="text"
                    value={mortgageBank}
                    onChange={(e) => setMortgageBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Nome do Imóvel</label>
                  <input
                    type="text"
                    value={mortgageProperty}
                    onChange={(e) => setMortgageProperty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Saldo Devedor Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mortgageDebt}
                    onChange={(e) => setMortgageDebt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Valor da Prestação Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mortgageInstallmentVal}
                    onChange={(e) => setMortgageInstallmentVal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Total de Meses</label>
                  <input
                    type="number"
                    value={mortgageInstallments}
                    onChange={(e) => setMortgageInstallments(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Parcelas Pagas</label>
                  <input
                    type="number"
                    value={mortgagePaid}
                    onChange={(e) => setMortgagePaid(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Taxa Juros a.a. (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mortgageRate}
                    onChange={(e) => setMortgageRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Sistema de Amortização</label>
                  <select
                    value={mortgageSystem}
                    onChange={(e) => setMortgageSystem(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="SAC">SAC (Prestação decrescente)</option>
                    <option value="PRICE">PRICE (Prestação fixa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Dia do Vencimento Mensal</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={mortgageDueDay}
                    onChange={(e) => setMortgageDueDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsEditMortgageOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold cursor-pointer"
                >
                  Salvar Financiamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Other Debt Modal */}
      {isAddDebtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#18181b] border border-[#27272a] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#fafafa]">
              {editingDebt ? 'Editar Dívida' : 'Cadastrar Nova Dívida / Financiamento'}
            </h3>

            <form onSubmit={handleSaveDebt} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#a1a1aa] font-medium mb-1">Título da Dívida *</label>
                <input
                  type="text"
                  placeholder="Ex: Financiamento Carro, Cartão Notebook..."
                  value={debtTitle}
                  onChange={(e) => setDebtTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Categoria</label>
                  <select
                    value={debtCategory}
                    onChange={(e) => setDebtCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-yellow-500 cursor-pointer"
                  >
                    <option value="veiculo">Carro / Veículo</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="emprestimo">Empréstimo Pessoal</option>
                    <option value="consignado">Consignado</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Credor / Banco</label>
                  <input
                    type="text"
                    placeholder="Ex: Santander, Nubank..."
                    value={debtCreditor}
                    onChange={(e) => setDebtCreditor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={debtTotal}
                    onChange={(e) => setDebtTotal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Saldo Restante (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={debtRemaining}
                    onChange={(e) => setDebtRemaining(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Valor Parcela</label>
                  <input
                    type="number"
                    step="0.01"
                    value={debtInstallmentVal}
                    onChange={(e) => setDebtInstallmentVal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Total Parcelas</label>
                  <input
                    type="number"
                    value={debtTotalInst}
                    onChange={(e) => setDebtTotalInst(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] font-medium mb-1">Pagas</label>
                  <input
                    type="number"
                    value={debtPaidInst}
                    onChange={(e) => setDebtPaidInst(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#fafafa] focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsAddDebtOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold cursor-pointer"
                >
                  Salvar Dívida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
