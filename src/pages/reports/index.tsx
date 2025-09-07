// src/pages/reports/index.tsx
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Download,
  Shield,
  Activity
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MonthlyData {
  month: string;
  year: number;
  income: number;
  expenses: number;
  balance: number;
  movementsCount: number;
}

interface ReportsData {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalMovements: number;
  monthlyData: MonthlyData[];
}

interface ApiResponse {
  success: boolean;
  error?: string;
  data?: ReportsData;
}

interface ChartData {
  period: string;
  fullMonth: string;
  ingresos: number;
  egresos: number;
  balance: number;
  movimientos: number;
}

const ReportsPage = () => {
  const { isLoading, isAdmin } = useProtectedRoute({ allowedRoles: ['ADMIN'] });
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthsFilter, setMonthsFilter] = useState('6');
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  const fetchReportsData = useCallback(async (months = 6) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?months=${months}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setReportsData(data.data);
      } else {
        console.error('Error fetching reports data:', data.error);
      }
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchReportsData(parseInt(monthsFilter));
    }
  }, [isLoading, isAdmin, monthsFilter, fetchReportsData]);

  const handleDownloadCSV = async () => {
    try {
      setDownloadingCSV(true);
      const response = await fetch('/api/reports/csv');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-movimientos-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Error downloading CSV');
        alert('Error descargando el archivo CSV');
      }
    } catch {
      console.error('Error downloading CSV');
      alert('Error descargando el archivo CSV');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatChartCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  // Preparar datos para el gráfico
  const chartData: ChartData[] = reportsData?.monthlyData.map(item => ({
    period: `${item.month.slice(0, 3)} ${item.year}`,
    fullMonth: `${item.month} ${item.year}`,
    ingresos: item.income,
    egresos: item.expenses,
    balance: item.balance,
    movimientos: item.movementsCount
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso Restringido
            </h2>
            <p className="text-gray-600">
              Solo los administradores pueden acceder a esta página
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Reportes - Finance App</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reportes Financieros
            </h1>
            <p className="mt-2 text-gray-600">
              Análisis detallado de tus movimientos financieros
            </p>
          </div>
          
          <Button 
            onClick={handleDownloadCSV}
            disabled={downloadingCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {downloadingCSV ? 'Descargando...' : 'Descargar CSV'}
          </Button>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Balance Total */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Balance Actual
                </CardTitle>
                <div className={`p-2 rounded-full ${
                  reportsData && reportsData.balance >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <DollarSign className={`h-4 w-4 ${
                    reportsData && reportsData.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  reportsData && reportsData.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(reportsData?.balance || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Saldo disponible
                </p>
              </CardContent>
            </Card>

            {/* Total Ingresos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Ingresos
                </CardTitle>
                <div className="p-2 rounded-full bg-green-50">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportsData?.totalIncome || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresos acumulados
                </p>
              </CardContent>
            </Card>

            {/* Total Egresos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Egresos
                </CardTitle>
                <div className="p-2 rounded-full bg-red-50">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportsData?.totalExpenses || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Gastos acumulados
                </p>
              </CardContent>
            </Card>

            {/* Total Movimientos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Movimientos
                </CardTitle>
                <div className="p-2 rounded-full bg-blue-50">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {reportsData?.totalMovements.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total transacciones
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chart Controls */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Análisis Temporal</CardTitle>
                <CardDescription>
                  Evolución de ingresos, egresos y balance por mes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={monthsFilter} onValueChange={setMonthsFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Últimos 3 meses</SelectItem>
                    <SelectItem value="6">Últimos 6 meses</SelectItem>
                    <SelectItem value="12">Último año</SelectItem>
                    <SelectItem value="24">Últimos 2 años</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={chartType} onValueChange={(value) => setChartType(value as 'line' | 'bar' | 'area')}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Líneas</SelectItem>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="area">Área</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No hay datos para mostrar en el período seleccionado
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={formatChartCurrency}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item?.fullMonth || label;
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ingresos" 
                        stroke="#16a34a" 
                        strokeWidth={2}
                        name="Ingresos"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="egresos" 
                        stroke="#dc2626" 
                        strokeWidth={2}
                        name="Egresos"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="Balance"
                      />
                    </LineChart>
                  ) : chartType === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={formatChartCurrency}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item?.fullMonth || label;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="ingresos" fill="#16a34a" name="Ingresos" />
                      <Bar dataKey="egresos" fill="#dc2626" name="Egresos" />
                    </BarChart>
                  ) : (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={formatChartCurrency}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item?.fullMonth || label;
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="ingresos" 
                        stackId="1"
                        stroke="#16a34a" 
                        fill="#16a34a" 
                        fillOpacity={0.6}
                        name="Ingresos"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="egresos" 
                        stackId="2"
                        stroke="#dc2626" 
                        fill="#dc2626" 
                        fillOpacity={0.6}
                        name="Egresos"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Details */}
        {!loading && chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detalle Mensual</CardTitle>
              <CardDescription>
                Resumen detallado de cada período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chartData.slice().reverse().map((monthData, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{monthData.fullMonth}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ingresos:</span>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(monthData.ingresos)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Egresos:</span>
                        <span className="text-red-600 font-medium">
                          {formatCurrency(monthData.egresos)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-gray-600">Balance:</span>
                        <span className={`font-medium ${
                          monthData.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(monthData.balance)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Movimientos:</span>
                        <Badge variant="outline" className="h-5">
                          {monthData.movimientos}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsPage;