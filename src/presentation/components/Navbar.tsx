import React from 'react';
import { useAuth } from '../application/AuthContext';
import {
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  UserPlus,
  LogOut,
  Shield,
  User,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, cart } = useAuth();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('catalog')}
          >
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Simple Stock Flow
              </span>
              <span className="text-xs block text-slate-400 font-medium">
                Inventarios y Ventas
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('catalog')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                currentView === 'catalog'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catálogo</span>
            </button>

            <button
              onClick={() => onNavigate('checkout')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition relative ${
                currentView === 'checkout'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Venta</span>
              {totalCartCount > 0 && (
                <span className="ml-1 bg-amber-500 text-slate-900 font-bold px-1.5 py-0.5 rounded-full text-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('sales')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                currentView === 'sales'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Historial</span>
            </button>

            <button
              onClick={() => onNavigate('report')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                currentView === 'report'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reporte</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => onNavigate('new-seller')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'new-seller'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Nuevo Vendedor</span>
              </button>
            )}
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              {user?.role === 'admin' ? (
                <span className="inline-flex items-center gap-1.5 bg-purple-900/60 text-purple-300 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-700/50">
                  <Shield className="w-3.5 h-3.5" /> Administrador
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-700/50">
                  <User className="w-3.5 h-3.5" /> Vendedor
                </span>
              )}
              <span className="font-medium text-slate-200">{user?.username}</span>
            </div>

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
