import React, { useState } from 'react';
import { useAuth } from '../../application/AuthContext';
import { apiClient, ApiError } from '../../infrastructure/http/apiClient';
import { UserPlus, ShieldAlert, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface NewSellerPageProps {
  onNavigate: (view: string) => void;
}

export const NewSellerPage: React.FC<NewSellerPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [createdSeller, setCreatedSeller] = useState<string | null>(null);

  // Invariant DP-04: Only admin can access this page
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Acceso Denegado</h2>
        <p className="text-sm text-slate-600 mt-2">
          Solo los administradores del sistema tienen autorización para registrar nuevos vendedores.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setCreatedSeller(null);

    // Client-side validations
    if (password !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    try {
      setLoading(true);
      // Invariant DP-04: Role is fixed to 'seller'
      await apiClient.registerSeller(username.trim(), password, 'seller');
      setCreatedSeller(username.trim());
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) {
          setFieldErrors(err.errors);
        }
      } else {
        setError('Ocurrió un error al registrar el vendedor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Registrar Nuevo Vendedor</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Cree una cuenta para permitir a un vendedor gestionar inventario y ventas.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {createdSeller && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 animate-fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <h4 className="font-semibold text-sm">Vendedor creado con éxito</h4>
                <p className="text-xs mt-0.5">
                  El usuario <strong>{createdSeller}</strong> ahora puede iniciar sesión con el rol de Vendedor.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div>
                <h4 className="font-semibold text-sm">Error al crear vendedor</h4>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ejemplo: carlos_ventas"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                  fieldErrors['username']
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
              {fieldErrors['username'] && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors['username'][0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Rol Asignado
              </label>
              <input
                type="text"
                disabled
                value="Vendedor (seller)"
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Por política de seguridad (DP-04), los nuevos usuarios son registrados estrictamente con rol de Vendedor.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres (letras y números)"
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                    fieldErrors['password']
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors['password'] && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors['password'][0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Confirmar Contraseña *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la contraseña"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition shadow-sm disabled:bg-slate-300"
              >
                {loading ? 'Creando vendedor...' : 'Registrar Vendedor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
