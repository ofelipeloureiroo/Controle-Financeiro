import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/Header';
import { HomeProjectsTab } from './components/home/HomeProjectsTab';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { TransactionsTab } from './components/transactions/TransactionsTab';
import { FreelanceClientsTab } from './components/freelance/FreelanceClientsTab';
import { BrazilInteractiveMap } from './components/map/BrazilInteractiveMap';
import { MortgageAndDebtsTab } from './components/mortgage/MortgageAndDebtsTab';
import { BanksAndCashTab } from './components/banks/BanksAndCashTab';
import { SavingsGoalsTab } from './components/goals/SavingsGoalsTab';
import { BudgetAndReportsTab } from './components/budget/BudgetAndReportsTab';
import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { AmortizationModal } from './components/modals/AmortizationModal';
import { TransferModal } from './components/modals/TransferModal';
import { CashActionModal } from './components/modals/CashActionModal';

const AppContent: React.FC = () => {
  // Default to the architect's home & portfolio showcase
  const [activeTab, setActiveTab] = useState<string>('home');

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
    <div className="min-h-screen bg-[#12100e] text-[#fcf8f5] flex flex-col selection:bg-[#c58a4b]/30 selection:text-[#fcf8f5] font-sans antialiased">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTxModal={() => handleOpenNewTx('expense')}
      />

      {/* Main Tab View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <HomeProjectsTab
            onNavigateTab={setActiveTab}
            onOpenNewTxModal={handleOpenNewTx}
          />
        )}

        {activeTab === 'overview' && (
          <OverviewTab
            onNavigateTab={setActiveTab}
            onOpenNewTxModal={handleOpenNewTx}
            onOpenAmortizationModal={() => setIsAmortizationModalOpen(true)}
            onNavigateToClients={() => setActiveTab('freelance')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab onOpenNewTxModal={handleOpenNewTx} />
        )}

        {activeTab === 'freelance' && (
          <FreelanceClientsTab onNavigateToMap={() => setActiveTab('map')} />
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#fcf8f5] font-serif">
                  Mapa Nacional de Projetos & Obras
                </h2>
                <p className="text-xs text-[#a89c93]">
                  Acompanhamento geográfico de clientes e consultorias presenciais e remotas em todo o Brasil.
                </p>
              </div>
            </div>
            <div className="p-6 bg-[#1a1614] rounded-2xl border border-[#3d342f] shadow-xl">
              <BrazilInteractiveMap />
            </div>
          </div>
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
