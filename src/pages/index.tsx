// src/pages/index.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity,
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalMovements: number;
  totalUsers?: number;
}

const HomePage = () => {
  const { isLoading, isAdmin } = useProtectedRoute();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener estadísticas básicas de movimientos
        const movementsResponse = await fetch('/api/movements?limit=1');
        if (movementsResponse.ok) {
          const movementsData = await movementsResponse.json();
          
          // Si es admin, obtener también reportes completos
          if (isAdmin) {
            const reportsResponse = await fetch('/api/reports');
            if (reportsResponse.ok) {
              const reportsData = await reportsResponse.json();
              setStats({
                balance: reportsData.data.balance,
                totalIncome: reportsData.data.totalIncome,
                totalExpenses: reportsData.data.totalExpenses,
                totalMovements: reportsData.data.totalMovements,
              });
            }
          } else {
            // Para usuarios normales, mostrar estadísticas básicas
            setStats({
              balance: 0,
              totalIncome: 0,
              totalExpenses: 0,
              totalMovements: movementsData.pagination?.total || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchStats();
    }
  }, [isLoading, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const dashboardCards = [
    {
      title: 'Balance Total',
      value: stats?.balance || 0,
      description: 'Saldo actual',
      icon: DollarSign,
      color: stats?.balance && stats.balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats?.balance && stats.balance >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Total Ingresos',
      value: stats?.totalIncome || 0,
      description: 'Ingresos acumulados',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Egresos',
      value: stats?.totalExpenses || 0,
      description: 'Gastos acumulados',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Movimientos',
      value: stats?.totalMovements || 0,
      description: 'Total de transacciones',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      isCount: true
    }
  ];

  const quickActions = [
    {
      title: 'Ver Movimientos',
      description: 'Gestiona tus ingresos y egresos',
      href: '/movements',
      icon: TrendingUp,
      allowedRoles: ['ADMIN', 'USER']
    },
    {
      title: 'Gestionar Usuarios',
      description: 'Administra los usuarios del sistema',
      href: '/users',
      icon: Users,
      allowedRoles: ['ADMIN']
    },
    {
      title: 'Ver Reportes',
      description: 'Analiza tus finanzas con gráficos',
      href: '/reports',
      icon: Activity,
      allowedRoles: ['ADMIN']
    }
  ];

  const filteredActions = quickActions.filter(action =>
    action.allowedRoles.includes(isAdmin ? 'ADMIN' : 'USER')
  );

  return (
    <MainLayout>
      <Head>
        <title>Inicio - Finance App</title>
      </Head>

      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido a Finance App
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona tus finanzas de manera eficiente y sencilla
          </p>
        </div>

        {/* Stats Cards */}
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
            {dashboardCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${card.color}`}>
                      {card.isCount ? 
                        card.value.toLocaleString() : 
                        formatCurrency(card.value)
                      }
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <Link href={action.href}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-full">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {action.title}
                          </CardTitle>
                          <CardDescription>
                            {action.description}
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </div>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;