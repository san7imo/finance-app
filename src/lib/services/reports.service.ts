// src/lib/services/reports.service.ts
import prisma from '@/lib/prisma';

export interface MonthlyData {
  month: string;
  year: number;
  income: number;
  expenses: number;
  balance: number;
  movementsCount: number;
}

export interface ReportsData {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalMovements: number;
  monthlyData: MonthlyData[];
}

export interface MovementCSVData {
  concepto: string;
  monto: number;
  fecha: string;
  usuario: string;
  tipo: 'Ingreso' | 'Egreso';
}

export class ReportsService {
  /**
   * Obtener datos para reportes y gráficos
   */
  static async getReportsData(months: number = 6): Promise<ReportsData> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Obtener estadísticas generales
    const [incomeResult, expensesResult, totalMovements] = await Promise.all([
      prisma.movement.aggregate({
        _sum: { amount: true },
        where: { amount: { gt: 0 } },
      }),
      prisma.movement.aggregate({
        _sum: { amount: true },
        where: { amount: { lt: 0 } },
      }),
      prisma.movement.count(),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = Math.abs(expensesResult._sum.amount || 0);
    const balance = totalIncome - totalExpenses;

    // Obtener datos mensuales
    const movements = await prisma.movement.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Agrupar por mes
    const monthlyMap = new Map<string, MonthlyData>();
    
    movements.forEach((movement) => {
      const date = new Date(movement.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: date.toLocaleString('es-ES', { month: 'long' }),
          year: date.getFullYear(),
          income: 0,
          expenses: 0,
          balance: 0,
          movementsCount: 0,
        });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.movementsCount++;

      if (movement.amount > 0) {
        monthData.income += movement.amount;
      } else {
        monthData.expenses += Math.abs(movement.amount);
      }

      monthData.balance = monthData.income - monthData.expenses;
    });

    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
    });

    return {
      balance,
      totalIncome,
      totalExpenses,
      totalMovements,
      monthlyData,
    };
  }

  /**
   * Obtener datos para exportar a CSV
   */
  static async getMovementsForCSV(): Promise<MovementCSVData[]> {
    const movements = await prisma.movement.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return movements.map((movement) => ({
      concepto: movement.concept,
      monto: Math.abs(movement.amount),
      fecha: movement.date.toISOString().split('T')[0], // YYYY-MM-DD
      usuario: movement.user.name || movement.user.email,
      tipo: movement.amount > 0 ? 'Ingreso' : 'Egreso',
    }));
  }

  /**
   * Generar CSV string
   */
  static generateCSV(data: MovementCSVData[]): string {
    const headers = ['Concepto', 'Monto', 'Fecha', 'Usuario', 'Tipo'];
    const csvContent = [
      headers.join(','),
      ...data.map((row) => [
        `"${row.concepto}"`,
        row.monto,
        row.fecha,
        `"${row.usuario}"`,
        row.tipo,
      ].join(',')),
    ].join('\n');

    return csvContent;
  }
}