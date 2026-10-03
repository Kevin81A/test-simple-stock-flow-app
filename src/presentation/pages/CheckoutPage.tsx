import React, { useState } from 'react';
import { useAuth } from '../../application/AuthContext';
import { apiClient, ApiError } from '../../infrastructure/http/apiClient';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (view: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSaleId, setSuccessSaleId] = useState<string | null>(null);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setError(null);
    if (cart.length === 0) {
      setError('El carrito está vacío. Agregue productos antes de realizar una venta.');
      return;
    }

    // Check stock locally before sending
    for (const item of cart) {
      if (item.quantity > item.availableStock) {
        setError(`El producto "${item.name}" supera el stock disponible (${item.availableStock}).`);
        return;
      }
      if (item.quantity <= 0) {
        setError(`La cantidad del producto "${item.name}" debe ser mayor a cero.`);
        return;
      }
    }

    try {
      setLoading(true);
      const lines = cart.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));

      const res = await apiClient.createSale(lines);
      setSuccessSaleId(res.id);
      clearCart();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al procesar la venta. Verifique los datos o el stock disponible.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (successSaleId) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">¡Venta Registrada Exitosamente!</h2>
          <p className="text-slate-600 mt-2">
            La transacción se completó y el inventario ha sido actualizado en tiempo real.
          </p>
          <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block text-left">
            <span className="text-xs uppercase font-semibold text-slate-400 block tracking-wider">
              Identificador de Venta
            </span>
            <code className="text-lg font-mono font-bold text-slate-900">{successSaleId}</code>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <button
              onClick={() => {
                setSuccessSaleId(null);
                onNavigate('catalog');
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm"
            >
              Nueva Venta (Catálogo)
            </button>
            <button
              onClick={() => {
                setSuccessSaleId(null);
                onNavigate('sales');
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Ver en Historial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-blue-600" />
            <span>Punto de Venta / Carrito</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revise los productos seleccionados antes de confirmar la transacción de venta.
          </p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium transition flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Vaciar Carrito</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <h4 className="font-semibold text-sm">Error en la transacción</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">El carrito de venta está vacío</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-6">
            Seleccione productos desde el catálogo para agregarlos y registrar una nueva venta.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm inline-flex items-center gap-2"
          >
            <span>Ir al Catálogo de Productos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Productos a Facturar ({cart.length})</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {cart.map((item) => {
                const subtotal = item.price * item.quantity;
                const hasStockIssue = item.quantity > item.availableStock;

                return (
                  <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Precio unitario: ${item.price.toLocaleString('es-CO', { minimumFractionDigits: 2 })} COP</span>
                        <span>•</span>
                        <span className={hasStockIssue ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                          Stock disponible: {item.availableStock}
                        </span>
                      </div>
                      {hasStockIssue && (
                        <p className="text-xs text-rose-600 font-medium mt-1">
                          ¡Advertencia: Cantidad seleccionada excede el stock actual!
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.availableStock}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              updateCartQuantity(item.productId, val);
                            }
                          }}
                          className="w-12 text-center text-sm font-semibold text-slate-800 border-none focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[100px]">
                        <span className="text-xs text-slate-400 block">Subtotal</span>
                        <span className="text-base font-bold text-slate-900">
                          ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                        title="Eliminar de la venta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Resumen de la Venta
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Líneas de productos</span>
                  <span className="font-semibold text-slate-800">{cart.length}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total unidades</span>
                  <span className="font-semibold text-slate-800">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Total a Pagar</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-600">
                      ${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-400 block font-normal">COP (Pesos Colombianos)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className={`w-full mt-6 py-3.5 px-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 shadow-sm ${
                  loading || cart.length === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <span>Procesando venta...</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Confirmar y Facturar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="w-full mt-3 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium text-center"
              >
                Seguir agregando productos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
