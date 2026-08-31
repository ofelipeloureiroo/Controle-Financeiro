import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/Header';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { TransactionsTab } from './components/transactions/TransactionsTab';
import { FreelanceClientsTab } from './components/freelance/FreelanceClientsTab';
import { MortgageAndDebtsTab } from './components/mortgage/MortgageAndDebtsTab';
import { BanksAndCashTab } from './components/banks/BanksAndCashTab';
import { SavingsGoalsTab } from './components/goals/SavingsGoalsTab';
import { BudgetAndReportsTab } from './components/budget/BudgetAndReportsTab';
import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { AmortizationModal } from './components/modals/AmortizationModal';
import { TransferModal } from './components/modals/TransferModal';
import { CashActionModal } from './components/modals/CashActionModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals state
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [newTxInitialType, setNewTxInitialType] = useState<'income' | 'expense'>('expense');
  const [newTxInitialCategoryOrSource, setNewTxInitialCategoryOrSource] = useState<string | undefined>();

  const [isAmortizationModalOpen, setIsAmortizationModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  const handleOpenNewTx = (initialType: 'income' | 'expense' = 'expense', catOrSource?: string) => {
    setNewTxInitialType(initialType);
    setNewTxInitialCategoryOrSource(catOrSource);
    setIsNewTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col selection:bg-emerald-500/20 selection:text-emerald-400 font-sans antialiased">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTxModal={() => handleOpenNewTx('expense')}
      />

      {/* Main Tab View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            onOpenNewTxModal={handleOpenNewTx}
            onOpenAmortizationModal={() => setIsAmortizationModalOpen(true)}
            onNavigateToClients={() => setActiveTab('freelance')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab onOpenNewTxModal={handleOpenNewTx} />
        )}

        {activeTab === 'freelance' && (
          <FreelanceClientsTab onNavigateToMap={() => setActiveTab('overview')} />
        )}

        {activeTab === 'mortgage' && (
          <MortgageAndDebtsTab
            onOpenAmortizationModal={() => setIsAmortizationModalOpen(true)}
          />
        )}

        {activeTab === 'banks' && (
          <BanksAndCashTab
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
            onOpenCashModal={() => setIsCashModalOpen(true)}
          />
        )}

        {activeTab === 'goals' && <SavingsGoalsTab />}

        {activeTab === 'budget' && <BudgetAndReportsTab />}
      </main>

      {/* Global Interactive Modals */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        initialType={newTxInitialType}
        initialCategoryOrSource={newTxInitialCategoryOrSource}
      />

      <AmortizationModal
        isOpen={isAmortizationModalOpen}
        onClose={() => setIsAmortizationModalOpen(false)}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <CashActionModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
