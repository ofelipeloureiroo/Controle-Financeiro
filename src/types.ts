export type TransactionType = 'income' | 'expense' | 'transfer';

export type IncomeSource = 'clt' | 'freelancer' | 'investment' | 'cash_entry' | 'rendimento' | 'other';

export type PaymentMethod = 'pix' | 'debito' | 'credito' | 'cartao_credito' | 'cartao_debito' | 'dinheiro_vivo' | 'boleto' | 'transferencia' | 'ted';

export type ExpenseCategory =
  | 'casa'
  | 'carro'
  | 'lazer'
  | 'alimentacao'
  | 'saude'
  | 'freela_tools'
  | 'educacao'
  | 'financiamento'
  | 'dividas'
  | 'impostos'
  | 'outros';

export interface BudgetLimits {
  casa: number;
  carro: number;
  lazer: number;
  alimentacao: number;
  saude: number;
  freela_tools: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  incomeSource?: IncomeSource;
  category?: ExpenseCategory;
  bankAccountId: string; // 'cash' for physical cash or bank id
  toBankAccountId?: string; // For transfers
  date: string; // YYYY-MM-DD
  status: 'completed' | 'pending';
  notes?: string;
  isRecurring?: boolean;
  clientName?: string;
  clientId?: string;
  projectId?: string;
  paymentMethod?: PaymentMethod;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'bank' | 'fintech' | 'investment' | 'physical_cash';
  balance: number;
  color: string;
  textColor?: string;
  iconName: string;
  accountNumber?: string;
  bankCode?: string;
  isDefault?: boolean;
}

export interface ExtraAmortization {
  id: string;
  date: string;
  amount: number;
  type: 'prazo' | 'prestacao';
  monthsReduced?: number;
  interestSaved?: number;
  notes?: string;
}

export interface HouseMortgage {
  enabled: boolean;
  bankName: string;
  propertyName: string;
  propertyValue: number;
  financedAmount: number;
  currentDebt: number;
  totalInstallments: number;
  paidInstallments: number;
  currentInstallmentValue: number;
  annualInterestRate: number; // e.g. 9.5%
  amortizationSystem: 'SAC' | 'PRICE';
  monthlyDueDate: number; // Day of month, e.g. 10
  extraAmortizations: ExtraAmortization[];
  targetPayoffYear?: number;
}

export interface Debt {
  id: string;
  title: string;
  category: 'cartao' | 'emprestimo' | 'veiculo' | 'consignado' | 'outro';
  totalAmount: number;
  remainingAmount: number;
  installmentValue: number;
  totalInstallments: number;
  paidInstallments: number;
  dueDate: number; // Day of month
  interestRate?: number;
  creditor: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  state: string; // UF: SP, RJ, MG, etc.
  city: string;
  serviceType: string;
  totalBilled: number;
  totalPaid: number;
  pendingAmount: number;
  status: 'active' | 'completed' | 'lead';
  projectsCount: number;
  createdAt: string;
  lastJobDate?: string;
  notes?: string;
}

export interface FreelanceProject {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description?: string;
  serviceType: string;
  state: string;
  city: string;
  totalValue: number;
  paidValue: number;
  status: 'prospect' | 'in_progress' | 'delivered' | 'paid' | 'cancelled';
  startDate: string;
  deadline: string;
  deliveredDate?: string;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: 'reserva' | 'reserva_emergencia' | 'casa' | 'financiamento' | 'viagem' | 'lazer' | 'carro' | 'reforma' | 'equipamento' | 'investimento' | 'outros';
  targetDate?: string;
  deadline?: string;
  color: string;
  iconName?: string;
  monthlyContribution?: number;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  name: string;
  monthlyBudget: number;
  color: string;
  iconName: string;
}

export interface BrazilStateInfo {
  uf: string;
  name: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  capital: string;
  svgPath: string;
  labelX: number;
  labelY: number;
}
