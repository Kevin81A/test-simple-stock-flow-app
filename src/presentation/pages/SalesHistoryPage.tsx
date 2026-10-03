import React, { useState, useEffect } from 'react';
import { apiClient, ApiError } from '../../infrastructure/http/apiClient';
import { SaleViewDto } from '../../infrastructure/dto/api.dto';
import { Receipt, Calendar, Eye, X, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export const SalesHistoryPage: React.FC = () => {
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(todayStr);
  const [sales, setSales] = useState<SaleViewDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected sale modal
  const [selectedSale, setSelectedSale] = useState<SaleViewDto | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);

      // Invariant: to is exclusive in the backend (from <= sold_at < to).
      // If user chooses endDate "2026-10-03", we query up to "2026-10-04T00:00:00Z" so the entire day is included.
      const fromIso = `${startDate}T00:00:00Z`;
      const endD = new Date(endDate);
      endD.setDate(endD.getDate() + 1);
      const toIso = `${endD.toISOString().split('T')[0]}T00:00:00Z`;

      const res = await apiClient.getSales(fromIso, toIso, page, pageSize);
      setSales(res.items);
      setTotalItems(res.total);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar el historial de ventas.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, startDate, endDate]);

  const handleOpenDetail = async (saleId: string) => {
    try {
      setModalLoading(true);
      const detail = await apiClient.getSale(saleId);
      setSelectedSale(detail);
    } catch (err: any) {
      alert('No se pudo cargar el detalle de la venta.');
    } finally {
      setModalLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Receipt className="w-7 h-7 text-blue-600" />
            <span>Historial de Ventas</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulte las ventas registradas, filtre por rango de fechas e inspeccione cada comprobante.
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <h4 className="font-semibold text-sm">Error en consulta</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Cargando registros de ventas...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No se encontraron ventas</h3>
            <p className="text-sm text-slate-500 mt-1">
              No hay transacciones registradas dentro del rango de fechas seleccionado.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-6">ID Venta</th>
                    <th className="py-3.5 px-6">Fecha y Hora</th>
                    <th className="py-3.5 px-6">Vendedor</th>
                    <th className="py-3.5 px-6 text-center">Ítems</th>
                    <th className="py-3.5 px-6 text-right">Total Facturado</th>
                    <th className="py-3.5 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {sale.id.slice(0, 8)}...{sale.id.slice(-4)}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {new Date(sale.soldAt).toLocaleString('es-CO', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">
                          {sale.sellerUsername || 'Vendedor'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-slate-700 font-semibold">
                        {sale.lines.length}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        ${sale.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })} COP
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleOpenDetail(sale.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Detalle</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500">
                Mostrando página <strong className="text-slate-800">{page}</strong> de{' '}
                <strong className="text-slate-800">{totalPages}</strong> (Total: {totalItems} ventas)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={`p-2 rounded-lg border text-xs font-medium transition ${
                    page <= 1
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                      : 'border-slate-300 text-slate-700 hover:bg-white bg-slate-100'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={`p-2 rounded-lg border text-xs font-medium transition ${
                    page >= totalPages
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                      : 'border-slate-300 text-slate-700 hover:bg-white bg-slate-100'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Comprobante de Venta</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedSale.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Fecha y Hora</span>
                  <span className="text-slate-800 font-medium">
                    {new Date(selectedSale.soldAt).toLocaleString('es-CO')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Vendedor Responsable</span>
                  <span className="text-slate-800 font-medium">
                    {selectedSale.sellerUsername || 'Usuario Vendedor'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Detalle de Productos Facturados
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-2.5 px-4 font-semibold">Producto</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Precio Unitario</th>
                        <th className="py-2.5 px-4 font-semibold text-center">Cantidad</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSale.lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {line.productName}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 font-mono">
                            ${line.unitPrice.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {line.quantity}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                            ${line.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Gran Total Facturado</span>
                <span className="text-xl font-black text-blue-700">
                  ${selectedSale.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })} COP
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs rounded-xl transition"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
