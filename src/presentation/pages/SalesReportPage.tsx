import React, { useState, useEffect } from 'react';
import { apiClient, ApiError } from '../../infrastructure/http/apiClient';
import { SalesReportDto } from '../../infrastructure/dto/api.dto';
import { BarChart3, Calendar, DollarSign, Package, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

export const SalesReportPage: React.FC = () => {
  // Default date range: current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(todayStr);
  const [report, setReport] = useState<SalesReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Invariant: to is exclusive in backend (from <= sold_at < to).
      const fromIso = `${startDate}T00:00:00Z`;
      const endD = new Date(endDate);
      endD.setDate(endD.getDate() + 1);
      const toIso = `${endD.toISOString().split('T')[0]}T00:00:00Z`;

      const data = await apiClient.getSalesReport(fromIso, toIso);
      setReport(data);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al generar el reporte consolidado de ventas.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const totalUnitsSold = report?.rows.reduce((acc, r) => acc + r.unitsSold, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            <span>Reporte Consolidado de Ventas</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Métricas de ingresos, volumen de ventas y desglose por producto según el período seleccionado.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title="Actualizar reporte"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <h4 className="font-semibold text-sm">Error en el reporte</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading && !report ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Generando cálculos y consolidando ventas...</p>
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Ingresos Totales (COP)
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  ${report.grandTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> En el período
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Transacciones Concretadas
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {report.salesCount}
                </span>
                <span className="text-xs text-slate-400 font-medium mt-1 block">
                  Comprobantes generados
                </span>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                <BarChart3 className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Unidades Vendidas
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {totalUnitsSold}
                </span>
                <span className="text-xs text-slate-400 font-medium mt-1 block">
                  Artículos entregados
                </span>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Package className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Rendimiento por Producto</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Productos vendidos durante el período con su nombre histórico congelado.
                </p>
              </div>
            </div>

            {report.rows.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-semibold text-sm">No hay ventas en este período</p>
                <p className="text-xs text-slate-400 mt-1">
                  Intente ampliando el rango de fechas en los filtros superiores.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Producto</th>
                      <th className="py-3.5 px-6 text-center">Unidades Vendidas</th>
                      <th className="py-3.5 px-6 text-right">Ingresos Generados</th>
                      <th className="py-3.5 px-6 text-right">% del Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {report.rows.map((row) => {
                      const percentage =
                        report.grandTotal > 0
                          ? ((row.revenue / report.grandTotal) * 100).toFixed(1)
                          : '0.0';

                      return (
                        <tr key={row.productId} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 px-6 font-semibold text-slate-800">
                            {row.productName}
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-slate-700">
                            {row.unitsSold}
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-slate-900 font-mono">
                            ${row.revenue.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs font-bold text-slate-600">{percentage}%</span>
                              <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(percentage)))}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
