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
  country?: string; // 'BR' | 'US' | 'PT' | 'IT' | 'ES' | 'GB' | 'FR' | 'DE' | 'CH' | 'AE' | 'CA' | 'AU' | 'JP' | 'AR' | etc.
  countryName?: string; // 'Brasil', 'Estados Unidos', 'Portugal', etc.
  countryFlag?: string; // '🇧🇷', '🇺🇸', '🇵🇹', etc.
  state: string; // UF or Region: SP, RJ, FL, Lisboa, Milão, etc.
  city: string;
  serviceType: string;
  currency?: string; // 'BRL' | 'USD' | 'EUR' | 'GBP'
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
  country?: string;
  countryName?: string;
  countryFlag?: string;
  state: string;
  city: string;
  currency?: string;
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

export interface ConstructionReport {
  id: string;
  date: string;
  text: string;
  images?: string[];
}

export type NicheType =
  | 'vendas'
  | 'advocacia'
  | 'arquitetura'
  | 'engenharia'
  | 'design'
  | 'consultoria'
  | 'saude_estetica'
  | 'imobiliario'
  | 'fotografia'
  | 'tecnologia'
  | 'marketing'
  | 'educacao'
  | 'eventos'
  | 'autonomo'
  | 'outro';

export type ThemeColorId =
  | 'gold'
  | 'emerald'
  | 'sapphire'
  | 'amethyst'
  | 'ruby'
  | 'amber'
  | 'cyan'
  | 'slate';

export interface ArchitectureProject {
  id: string;
  title: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  category:
    | 'residencial'
    | 'interiores'
    | 'cozinha_gourmet'
    | 'suite_master'
    | 'living'
    | 'comercial'
    | 'consultoria'
    | string;
  country?: string;
  countryName?: string;
  countryFlag?: string;
  location: string; // e.g. "Miami, Flórida (EUA)" or "Cascais, Lisboa (Portugal)" or "Rio Bonito, RJ"
  state: string; // UF or Region
  areaM2?: number; // e.g. 140
  honorarios?: number; // e.g. 12500
  paidAmount?: number;
  currency?: string;
  status: 'estudo_preliminar' | 'anteprojeto' | 'executivo' | 'obra' | 'entregue';
  coverImage: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  description?: string;
  deliveryDate?: string;
  startDate?: string;
  featured?: boolean;
  tags?: string[];
  createdAt?: string;
  reports?: ConstructionReport[];
}

export interface WorldCountry {
  code: string; // e.g. 'BR', 'US', 'PT', 'IT'
  name: string; // 'Brasil', 'Estados Unidos', 'Portugal'
  flag: string; // '🇧🇷', '🇺🇸', '🇵🇹'
  continent: 'América do Sul' | 'América do Norte' | 'Europa' | 'Ásia' | 'Oceania' | 'África' | 'Oriente Médio' | 'Oriente Médio & Ásia';
  capital: string;
  currency: string; // 'BRL', 'USD', 'EUR', 'GBP'
  currencySymbol: string;
  cx: number; // SVG coordinates on 1000x520 world projection
  cy: number;
  polygonPath?: string;
  timeZone: string;
  dialCode?: string;
}

export interface ContinentInfo {
  name: string;
  color: string;
  countries: string[]; // country codes
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

export interface ArchitectProfile {
  name: string;
  title: string;
  photoUrl: string;
  location: string;
  specialty: string;
  tagline: string;
  description: string;
  instagramHandle: string;
  instagramUrl: string;
  followersCount: string;
  rating: number;
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  bankInfo?: string;
  niche?: NicheType;
  nicheCustomName?: string;
  themeColor?: ThemeColorId;
  customAccentColor?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface ProjectInstallment {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  clientPhone?: string;
  installmentNumber: number;
  totalInstallments: number;
  description: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  paidAmount?: number;
  bankAccountId?: string;
  pixKey?: string;
  notes?: string;
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  clientPhone?: string;
  title: string;
  stage: 'briefing' | 'estudo_preliminar' | 'anteprojeto' | 'executivo' | 'obra' | 'entregue';
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedDate?: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  notes?: string;
  createdAt: string;
}

