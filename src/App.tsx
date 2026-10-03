import React, { useState } from 'react';
import { useAuth } from './application/AuthContext';
import { Navbar } from './presentation/components/Navbar';
import { LoginPage } from './presentation/pages/LoginPage';
import { CatalogPage } from './presentation/pages/CatalogPage';
import { CheckoutPage } from './presentation/pages/CheckoutPage';
import { SalesHistoryPage } from './presentation/pages/SalesHistoryPage';
import { SalesReportPage } from './presentation/pages/SalesReportPage';
import { NewSellerPage } from './presentation/pages/NewSellerPage';

export const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('catalog');

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1 pb-16">
        {currentView === 'catalog' && <CatalogPage />}
        {currentView === 'checkout' && <CheckoutPage onNavigate={setCurrentView} />}
        {currentView === 'sales' && <SalesHistoryPage />}
        {currentView === 'report' && <SalesReportPage />}
        {currentView === 'new-seller' && <NewSellerPage onNavigate={setCurrentView} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Simple Stock Flow · Sistema de Inventarios y Ventas</span>
          <span className="font-medium text-slate-400">
            Prueba Técnica SDD · SENA ADSO Ficha 3413974
          </span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};
