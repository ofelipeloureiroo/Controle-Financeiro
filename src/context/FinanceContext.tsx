import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_ARCHITECT_PROFILE,
  INITIAL_ARCHITECTURE_PROJECTS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_CATEGORY_BUDGETS,
  INITIAL_CLIENTS,
  INITIAL_DEBTS,
  INITIAL_FREELANCE_PROJECTS,
  INITIAL_HOUSE_MORTGAGE,
  INITIAL_SAVINGS_GOALS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import {
  ArchitectProfile,
  ArchitectureProject,
  BankAccount,
  CategoryBudget,
  Client,
  Debt,
  ExtraAmortization,
  FreelanceProject,
  HouseMortgage,
  SavingsGoal,
  Transaction,
} from '../types';

interface FinanceContextType {
  architectProfile: ArchitectProfile;
  updateArchitectProfile: (profile: Partial<ArchitectProfile>) => void;
  updateProfilePhoto: (photoUrl: string) => void;
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  houseMortgage: HouseMortgage;
  debts: Debt[];
  clients: Client[];
  freelanceProjects: FreelanceProject[];
  architectureProjects: ArchitectureProject[];
  savingsGoals: SavingsGoal[];
  categoryBudgets: CategoryBudget[];
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;

  // Actions - Architecture Projects & Photos
  addArchitectureProject: (project: Omit<ArchitectureProject, 'id' | 'createdAt'>) => void;
  updateArchitectureProject: (id: string, project: Partial<ArchitectureProject>) => void;
  deleteArchitectureProject: (id: string) => void;
  addPhotoToProject: (projectId: string, photoUrl: string) => void;
  removePhotoFromProject: (projectId: string, photoIndex: number) => void;

  // Actions - Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Actions - Banks & Physical Cash
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  transferFunds: (fromId: string, toId: string, amount: number, description: string) => void;
  adjustPhysicalCash: (amount: number, type: 'deposit' | 'withdraw', note: string) => void;

  // Actions - Mortgage & Debts
  updateMortgage: (mortgage: Partial<HouseMortgage>) => void;
  applyMortgageAmortization: (
    amount: number,
    type: 'prazo' | 'prestacao',
    fromAccountId: string,
    notes?: string
  ) => void;
  payMortgageInstallment: (fromAccountId: string) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  payDebtInstallment: (debtId: string, fromAccountId: string) => void;

  // Actions - Freelancer & Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalBilled' | 'totalPaid' | 'pendingAmount' | 'projectsCount'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addFreelanceProject: (project: Omit<FreelanceProject, 'id' | 'createdAt'>) => void;
  updateFreelanceProject: (id: string, project: Partial<FreelanceProject>) => void;
  deleteFreelanceProject: (id: string) => void;
  receiveProjectPayment: (projectId: string, amount: number, bankAccountId: string) => void;

  // Actions - Goals & Budgets
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, fromAccountId: string) => void;
  updateCategoryBudget: (category: string, monthlyBudget: number) => void;

  // Computed Financial Metrics
  totalNetWorth: number;
  totalBankBalance: number;
  totalPhysicalCash: number;
  currentMonthTransactions: Transaction[];
  monthlyIncomeCLT: number;
  monthlyIncomeFreelance: number;
  monthlyTotalIncome: number;
  monthlyTotalExpense: number;
  monthlyExpenseCasa: number;
  monthlyExpenseCarro: number;
  monthlyExpenseLazer: number;
  monthlyBalance: number;
  clientsByState: Record<string, { clientsCount: number; totalBilled: number; projectsCount: number; clients: Client[] }>;
  statesWithJobsCount: number;

  // Backup / Reset / Export
  exportDataJSON: () => void;
  exportTransactionsCSV: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'financas_freela_transactions_v1',
  ACCOUNTS: 'financas_freela_accounts_v1',
  MORTGAGE: 'financas_freela_mortgage_v1',
  DEBTS: 'financas_freela_debts_v1',
  CLIENTS: 'financas_freela_clients_v1',
  PROJECTS: 'financas_freela_projects_v1',
  ARCHITECTURE_PROJECTS: 'laine_paula_arch_projects_v1',
  GOALS: 'financas_freela_goals_v1',
  BUDGETS: 'financas_freela_budgets_v1',
  PROFILE: 'laine_paula_profile_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [architectProfile, setArchitectProfile] = useState<ArchitectProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? { ...INITIAL_ARCHITECT_PROFILE, ...JSON.parse(saved) } : INITIAL_ARCHITECT_PROFILE;
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  const [houseMortgage, setHouseMortgage] = useState<HouseMortgage>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MORTGAGE);
    return saved ? JSON.parse(saved) : INITIAL_HOUSE_MORTGAGE;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [freelanceProjects, setFreelanceProjects] = useState<FreelanceProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_FREELANCE_PROJECTS;
  });

  const [architectureProjects, setArchitectureProjects] = useState<ArchitectureProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARCHITECTURE_PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_ARCHITECTURE_PROJECTS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORY_BUDGETS;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MORTGAGE, JSON.stringify(houseMortgage));
  }, [houseMortgage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(freelanceProjects));
  }, [freelanceProjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARCHITECTURE_PROJECTS, JSON.stringify(architectureProjects));
  }, [architectureProjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(freelanceProjects));
  }, [freelanceProjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(architectProfile));
  }, [architectProfile]);

  // Actions - Profile
  const updateArchitectProfile = (updatedFields: Partial<ArchitectProfile>) => {
    setArchitectProfile((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const updateProfilePhoto = (photoUrl: string) => {
    setArchitectProfile((prev) => ({
      ...prev,
      photoUrl,
    }));
  };

  // Actions
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance if completed
    if (newTx.status === 'completed') {
      if (newTx.type === 'income') {
        setBankAccounts((prev) =>
          prev.map((acc) =>
            acc.id === newTx.bankAccountId ? { ...acc, balance: acc.balance + newTx.amount } : acc
          )
        );
      } else if (newTx.type === 'expense') {
        setBankAccounts((prev) =>
          prev.map((acc) =>
            acc.id === newTx.bankAccountId ? { ...acc, balance: acc.balance - newTx.amount } : acc
          )
        );
      }
    }
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedFields } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx && tx.status === 'completed') {
      // Revert balance change
      if (tx.type === 'income') {
        setBankAccounts((prev) =>
          prev.map((acc) =>
            acc.id === tx.bankAccountId ? { ...acc, balance: acc.balance - tx.amount } : acc
          )
        );
      } else if (tx.type === 'expense') {
        setBankAccounts((prev) =>
          prev.map((acc) =>
            acc.id === tx.bankAccountId ? { ...acc, balance: acc.balance + tx.amount } : acc
          )
        );
      }
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addBankAccount = (accountData: Omit<BankAccount, 'id'>) => {
    const newAcc: BankAccount = {
      ...accountData,
      id: `bank-${Date.now()}`,
    };
    setBankAccounts((prev) => [...prev, newAcc]);
  };

  const updateBankAccount = (id: string, updatedFields: Partial<BankAccount>) => {
    setBankAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updatedFields } : acc))
    );
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const transferFunds = (
    fromId: string,
    toId: string,
    amount: number,
    description: string
  ) => {
    if (amount <= 0 || fromId === toId) return;

    const fromAcc = bankAccounts.find((a) => a.id === fromId);
    const toAcc = bankAccounts.find((a) => a.id === toId);

    if (!fromAcc || !toAcc) return;

    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
        if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
        return acc;
      })
    );

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const transferTx: Transaction = {
      id: `tx-tf-${Date.now()}`,
      description: description || `Transferência de ${fromAcc.name} para ${toAcc.name}`,
      amount,
      type: 'transfer',
      bankAccountId: fromId,
      toBankAccountId: toId,
      date: dateStr,
      status: 'completed',
      notes: `Transferência interna entre contas.`,
    };

    setTransactions((prev) => [transferTx, ...prev]);
  };

  const adjustPhysicalCash = (amount: number, type: 'deposit' | 'withdraw', note: string) => {
    const cashAcc = bankAccounts.find((a) => a.type === 'physical_cash') || bankAccounts.find((a) => a.id === 'cash-wallet');
    if (!cashAcc) return;

    const now = new Date().toISOString().split('T')[0];

    if (type === 'deposit') {
      setBankAccounts((prev) =>
        prev.map((acc) => (acc.id === cashAcc.id ? { ...acc, balance: acc.balance + amount } : acc))
      );
      addTransaction({
        description: `Entrada Dinheiro Físico / Cofre: ${note || 'Depósito em espécie'}`,
        amount,
        type: 'income',
        incomeSource: 'cash_entry',
        bankAccountId: cashAcc.id,
        date: now,
        status: 'completed',
        paymentMethod: 'dinheiro_vivo',
        notes: note,
      });
    } else {
      setBankAccounts((prev) =>
        prev.map((acc) => (acc.id === cashAcc.id ? { ...acc, balance: Math.max(0, acc.balance - amount) } : acc))
      );
      addTransaction({
        description: `Saída Dinheiro Físico: ${note || 'Gasto em espécie'}`,
        amount,
        type: 'expense',
        category: 'outros',
        bankAccountId: cashAcc.id,
        date: now,
        status: 'completed',
        paymentMethod: 'dinheiro_vivo',
        notes: note,
      });
    }
  };

  const updateMortgage = (updated: Partial<HouseMortgage>) => {
    setHouseMortgage((prev) => ({ ...prev, ...updated }));
  };

  const applyMortgageAmortization = (
    amount: number,
    type: 'prazo' | 'prestacao',
    fromAccountId: string,
    notes?: string
  ) => {
    if (amount <= 0) return;

    const remainingInstallments = Math.max(1, houseMortgage.totalInstallments - houseMortgage.paidInstallments);
    const monthlyAmortization = houseMortgage.currentDebt / remainingInstallments;
    const monthsReduced = type === 'prazo' ? Math.min(remainingInstallments - 1, Math.max(1, Math.floor(amount / (monthlyAmortization || 1)))) : 0;
    const monthlyRate = Math.pow(1 + houseMortgage.annualInterestRate / 100, 1 / 12) - 1;
    const interestSaved = Math.round(amount * monthlyRate * (remainingInstallments / 2));

    const extra: ExtraAmortization = {
      id: `amort-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      type,
      monthsReduced,
      interestSaved,
      notes: notes || `Amortização extraordinária por ${type === 'prazo' ? 'redução de prazo' : 'redução da prestação'}`,
    };

    // Deduct from account
    setBankAccounts((prev) =>
      prev.map((acc) => (acc.id === fromAccountId ? { ...acc, balance: acc.balance - amount } : acc))
    );

    // Update mortgage debt
    setHouseMortgage((prev) => {
      const newDebt = Math.max(0, prev.currentDebt - amount);
      const newTotalInstallments = type === 'prazo' ? Math.max(prev.paidInstallments + 1, prev.totalInstallments - monthsReduced) : prev.totalInstallments;
      const newRemaining = Math.max(1, newTotalInstallments - prev.paidInstallments);
      const newInstallmentValue = (newDebt / newRemaining) + (newDebt * monthlyRate);

      return {
        ...prev,
        currentDebt: newDebt,
        totalInstallments: newTotalInstallments,
        currentInstallmentValue: type === 'prestacao' ? newInstallmentValue : prev.currentInstallmentValue,
        extraAmortizations: [extra, ...prev.extraAmortizations],
      };
    });

    // Record transaction
    addTransaction({
      description: `Amortização Extraordinária Financiamento Casa (${type === 'prazo' ? 'Redução de Prazo' : 'Redução de Parcela'})`,
      amount,
      type: 'expense',
      category: 'financiamento',
      bankAccountId: fromAccountId,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod: 'pix',
      notes: `Abatimento de ${monthsReduced > 0 ? `${monthsReduced} meses` : 'parcela'}. Economia de juros estimada: ~R$ ${interestSaved.toLocaleString('pt-BR')}`,
    });
  };

  const payMortgageInstallment = (fromAccountId: string) => {
    const installmentValue = houseMortgage.currentInstallmentValue;
    
    // Deduct from account
    setBankAccounts((prev) =>
      prev.map((acc) => (acc.id === fromAccountId ? { ...acc, balance: acc.balance - installmentValue } : acc))
    );

    // Update mortgage
    setHouseMortgage((prev) => {
      const remainingInstallments = Math.max(1, prev.totalInstallments - prev.paidInstallments);
      const monthlyAmortization = prev.currentDebt / remainingInstallments;
      const newDebt = Math.max(0, prev.currentDebt - monthlyAmortization);
      const newPaid = prev.paidInstallments + 1;
      const monthlyRate = Math.pow(1 + prev.annualInterestRate / 100, 1 / 12) - 1;
      const newRemaining = Math.max(1, prev.totalInstallments - newPaid);
      const nextInstallmentValue = (newDebt / newRemaining) + (newDebt * monthlyRate);

      return {
        ...prev,
        paidInstallments: newPaid,
        currentDebt: newDebt,
        currentInstallmentValue: prev.amortizationSystem === 'SAC' ? nextInstallmentValue : prev.currentInstallmentValue,
      };
    });

    // Add transaction
    addTransaction({
      description: `Parcela Financiamento Casa (${houseMortgage.paidInstallments + 1}/${houseMortgage.totalInstallments})`,
      amount: installmentValue,
      type: 'expense',
      category: 'casa',
      bankAccountId: fromAccountId,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod: 'transferencia',
      notes: `Pagamento mensal da parcela habitacional`,
    });
  };

  const addDebt = (debtData: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debtData,
      id: `debt-${Date.now()}`,
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const updateDebt = (id: string, updatedFields: Partial<Debt>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d)));
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const payDebtInstallment = (debtId: string, fromAccountId: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const val = debt.installmentValue;

    // Deduct from account
    setBankAccounts((prev) =>
      prev.map((acc) => (acc.id === fromAccountId ? { ...acc, balance: acc.balance - val } : acc))
    );

    // Update debt
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newPaid = d.paidInstallments + 1;
          const newRemaining = Math.max(0, d.remainingAmount - val);
          return {
            ...d,
            paidInstallments: newPaid,
            remainingAmount: newRemaining,
          };
        }
        return d;
      })
    );

    // Transaction
    addTransaction({
      description: `Pagamento Parcela: ${debt.title} (${debt.paidInstallments + 1}/${debt.totalInstallments})`,
      amount: val,
      type: 'expense',
      category: debt.category === 'veiculo' ? 'carro' : 'dividas',
      bankAccountId: fromAccountId,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod: 'pix',
      notes: `Credor: ${debt.creditor}`,
    });
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalBilled' | 'totalPaid' | 'pendingAmount' | 'projectsCount'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${clientData.state.toLowerCase()}-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalBilled: 0,
      totalPaid: 0,
      pendingAmount: 0,
      projectsCount: 0,
      status: 'active',
    };
    setClients((prev) => [newClient, ...prev]);
  };

  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const addFreelanceProject = (projectData: Omit<FreelanceProject, 'id' | 'createdAt'>) => {
    const newProj: FreelanceProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
    };
    setFreelanceProjects((prev) => [newProj, ...prev]);

    // Update client stats
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === projectData.clientId) {
          const newBilled = c.totalBilled + projectData.totalValue;
          const newPaid = c.totalPaid + projectData.paidValue;
          const newPending = newBilled - newPaid;
          return {
            ...c,
            totalBilled: newBilled,
            totalPaid: newPaid,
            pendingAmount: newPending,
            projectsCount: c.projectsCount + 1,
            lastJobDate: projectData.startDate,
            status: 'active',
          };
        }
        return c;
      })
    );

    // If paid value > 0, record initial transaction
    if (projectData.paidValue > 0) {
      const defaultBank = bankAccounts.find((b) => b.isDefault)?.id || bankAccounts[0]?.id || 'cash-wallet';
      addTransaction({
        description: `Sinal Freela: ${projectData.title} (${projectData.clientName})`,
        amount: projectData.paidValue,
        type: 'income',
        incomeSource: 'freelancer',
        bankAccountId: defaultBank,
        date: projectData.startDate,
        status: 'completed',
        paymentMethod: 'pix',
        clientName: projectData.clientName,
        clientId: projectData.clientId,
        projectId: newProj.id,
      });
    }
  };

  const updateFreelanceProject = (id: string, updatedFields: Partial<FreelanceProject>) => {
    setFreelanceProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteFreelanceProject = (id: string) => {
    setFreelanceProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Architecture Projects & Portfolio Actions
  const addArchitectureProject = (projectData: Omit<ArchitectureProject, 'id' | 'createdAt'>) => {
    const newProj: ArchitectureProject = {
      ...projectData,
      id: `proj-arch-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setArchitectureProjects((prev) => [newProj, ...prev]);
  };

  const updateArchitectureProject = (id: string, updatedFields: Partial<ArchitectureProject>) => {
    setArchitectureProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteArchitectureProject = (id: string) => {
    setArchitectureProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const addPhotoToProject = (projectId: string, photoUrl: string) => {
    if (!photoUrl.trim()) return;
    setArchitectureProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const currentImages = p.images || [];
          return {
            ...p,
            images: [...currentImages, photoUrl.trim()],
          };
        }
        return p;
      })
    );
  };

  const removePhotoFromProject = (projectId: string, photoIndex: number) => {
    setArchitectureProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const currentImages = [...(p.images || [])];
          currentImages.splice(photoIndex, 1);
          return {
            ...p,
            images: currentImages,
          };
        }
        return p;
      })
    );
  };

  const receiveProjectPayment = (projectId: string, amount: number, bankAccountId: string) => {
    const project = freelanceProjects.find((p) => p.id === projectId);
    if (!project || amount <= 0) return;

    const newPaid = project.paidValue + amount;
    const isFullyPaid = newPaid >= project.totalValue;

    setFreelanceProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              paidValue: newPaid,
              status: isFullyPaid ? 'paid' : p.status,
            }
          : p
      )
    );

    // Update Client
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === project.clientId) {
          const totalPaid = c.totalPaid + amount;
          const pendingAmount = Math.max(0, c.totalBilled - totalPaid);
          return {
            ...c,
            totalPaid,
            pendingAmount,
          };
        }
        return c;
      })
    );

    // Record Income Transaction
    addTransaction({
      description: `Recebimento Freela: ${project.title} (${project.clientName})`,
      amount,
      type: 'income',
      incomeSource: 'freelancer',
      bankAccountId,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod: 'pix',
      clientName: project.clientName,
      clientId: project.clientId,
      projectId: project.id,
    });
  };

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, updatedFields: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedFields } : g))
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const contributeToGoal = (goalId: string, amount: number, fromAccountId: string) => {
    if (amount <= 0) return;

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    // Deduct from bank account
    setBankAccounts((prev) =>
      prev.map((acc) => (acc.id === fromAccountId ? { ...acc, balance: acc.balance - amount } : acc))
    );

    // Add to goal
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );

    // Record transaction
    addTransaction({
      description: `Aporte Meta: ${goal.title}`,
      amount,
      type: 'expense',
      category: 'outros',
      bankAccountId: fromAccountId,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: `Aporte direcionado para reserva/meta`,
    });
  };

  const updateCategoryBudget = (category: string, monthlyBudget: number) => {
    setCategoryBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, monthlyBudget } : b))
    );
  };

  // Computations
  const totalBankBalance = useMemo(() => {
    return bankAccounts
      .filter((a) => a.type !== 'physical_cash')
      .reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [bankAccounts]);

  const totalPhysicalCash = useMemo(() => {
    return bankAccounts
      .filter((a) => a.type === 'physical_cash' || a.id === 'cash-wallet')
      .reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [bankAccounts]);

  const totalNetWorth = useMemo(() => {
    return totalBankBalance + totalPhysicalCash;
  }, [totalBankBalance, totalPhysicalCash]);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const monthlyIncomeCLT = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income' && t.incomeSource === 'clt' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthlyIncomeFreelance = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income' && t.incomeSource === 'freelancer' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthlyTotalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthlyTotalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthlyExpenseCasa = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense' && (t.category === 'casa' || t.category === 'financiamento') && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthlyExpenseCarro = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense' && t.category === 'carro' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthlyExpenseLazer = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense' && t.category === 'lazer' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthlyBalance = useMemo(() => {
    return monthlyTotalIncome - monthlyTotalExpense;
  }, [monthlyTotalIncome, monthlyTotalExpense]);

  // Clients grouped by Brazil state
  const clientsByState = useMemo(() => {
    const map: Record<string, { clientsCount: number; totalBilled: number; projectsCount: number; clients: Client[] }> = {};

    clients.forEach((c) => {
      const uf = (c.state || '').toUpperCase().trim();
      if (!uf) return;
      if (!map[uf]) {
        map[uf] = { clientsCount: 0, totalBilled: 0, projectsCount: 0, clients: [] };
      }
      map[uf].clientsCount += 1;
      map[uf].totalBilled += c.totalBilled || 0;
      map[uf].projectsCount += c.projectsCount || 0;
      map[uf].clients.push(c);
    });

    return map;
  }, [clients]);

  const statesWithJobsCount = useMemo(() => {
    return Object.keys(clientsByState).length;
  }, [clientsByState]);

  // Export / Import / Reset
  const exportDataJSON = () => {
    const exportObject = {
      transactions,
      bankAccounts,
      houseMortgage,
      debts,
      clients,
      freelanceProjects,
      savingsGoals,
      categoryBudgets,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `financas_freela_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportTransactionsCSV = () => {
    const headers = ['ID', 'Data', 'Descrição', 'Tipo', 'Origem/Categoria', 'Valor (R$)', 'Status', 'Conta/Banco', 'Cliente'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      t.type === 'income' ? t.incomeSource || '' : t.category || '',
      t.amount.toFixed(2).replace('.', ','),
      t.status,
      bankAccounts.find((a) => a.id === t.bankAccountId)?.name || t.bankAccountId,
      t.clientName ? `"${t.clientName.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `extrato_financeiro_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions) setTransactions(data.transactions);
      if (data.bankAccounts) setBankAccounts(data.bankAccounts);
      if (data.houseMortgage) setHouseMortgage(data.houseMortgage);
      if (data.debts) setDebts(data.debts);
      if (data.clients) setClients(data.clients);
      if (data.freelanceProjects) setFreelanceProjects(data.freelanceProjects);
      if (data.architectureProjects) setArchitectureProjects(data.architectureProjects);
      if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
      if (data.categoryBudgets) setCategoryBudgets(data.categoryBudgets);
      if (data.architectProfile) setArchitectProfile(data.architectProfile);
      return true;
    } catch {
      return false;
    }
  };

  const resetAllData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setHouseMortgage(INITIAL_HOUSE_MORTGAGE);
    setDebts(INITIAL_DEBTS);
    setClients(INITIAL_CLIENTS);
    setFreelanceProjects(INITIAL_FREELANCE_PROJECTS);
    setArchitectureProjects(INITIAL_ARCHITECTURE_PROJECTS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setCategoryBudgets(INITIAL_CATEGORY_BUDGETS);
    setArchitectProfile(INITIAL_ARCHITECT_PROFILE);
  };

  return (
    <FinanceContext.Provider
      value={{
        architectProfile,
        updateArchitectProfile,
        updateProfilePhoto,
        transactions,
        bankAccounts,
        houseMortgage,
        debts,
        clients,
        freelanceProjects,
        architectureProjects,
        savingsGoals,
        categoryBudgets,
        selectedMonth,
        setSelectedMonth,
        addArchitectureProject,
        updateArchitectureProject,
        deleteArchitectureProject,
        addPhotoToProject,
        removePhotoFromProject,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        transferFunds,
        adjustPhysicalCash,
        updateMortgage,
        applyMortgageAmortization,
        payMortgageInstallment,
        addDebt,
        updateDebt,
        deleteDebt,
        payDebtInstallment,
        addClient,
        updateClient,
        deleteClient,
        addFreelanceProject,
        updateFreelanceProject,
        deleteFreelanceProject,
        receiveProjectPayment,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        updateCategoryBudget,
        totalNetWorth,
        totalBankBalance,
        totalPhysicalCash,
        currentMonthTransactions,
        monthlyIncomeCLT,
        monthlyIncomeFreelance,
        monthlyTotalIncome,
        monthlyTotalExpense,
        monthlyExpenseCasa,
        monthlyExpenseCarro,
        monthlyExpenseLazer,
        monthlyBalance,
        clientsByState,
        statesWithJobsCount,
        exportDataJSON,
        exportTransactionsCSV,
        importDataJSON,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
