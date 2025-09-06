// src/lib/services/movements.service.ts
import prisma from '@/lib/prisma';
import { Movement, User } from '@prisma/client';

export interface CreateMovementDto {
  concept: string;
  amount: number;
  date?: Date;
}

export interface UpdateMovementDto {
  concept?: string;
  amount?: number;
  date?: Date;
}

export interface MovementFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  concept?: string;
  page?: number;
  limit?: number;
}

export interface MovementWithUser extends Movement {
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface PaginatedMovements {
  movements: MovementWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class MovementsService {
  /**
   * Obtener movimientos con filtros y paginación
   */
  static async getMovements(filters: MovementFilters = {}): Promise<PaginatedMovements> {
    const {
      userId,
      startDate,
      endDate,
      concept,
      page = 1,
      limit = 10,
    } = filters;

    // Construir condiciones de filtro con tipos explícitos
    const where: {
      userId?: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
      concept?: {
        contains: string;
        mode: 'insensitive';
      };
    } = {};

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    if (concept) {
      where.concept = {
        contains: concept,
        mode: 'insensitive',
      };
    }

    // Contar total de registros
    const total = await prisma.movement.count({ where });

    // Obtener movimientos con paginación
    const movements = await prisma.movement.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Crear un nuevo movimiento
   */
  static async createMovement(
    userId: string,
    data: CreateMovementDto
  ): Promise<MovementWithUser> {
    const movement = await prisma.movement.create({
      data: {
        ...data,
        userId,
        date: data.date || new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return movement;
  }

  /**
   * Obtener un movimiento por ID
   */
  static async getMovementById(id: string): Promise<MovementWithUser | null> {
    const movement = await prisma.movement.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return movement;
  }

  /**
   * Actualizar un movimiento
   */
  static async updateMovement(
    id: string,
    data: UpdateMovementDto
  ): Promise<MovementWithUser> {
    const movement = await prisma.movement.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return movement;
  }

  /**
   * Eliminar un movimiento
   */
  static async deleteMovement(id: string): Promise<void> {
    await prisma.movement.delete({
      where: { id },
    });
  }

  /**
   * Obtener balance total
   */
  static async getBalance(): Promise<number> {
    const result = await prisma.movement.aggregate({
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  /**
   * Obtener estadísticas de movimientos
   */
  static async getMovementStats(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    totalMovements: number;
  }> {
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

    return {
      totalIncome,
      totalExpenses,
      balance,
      totalMovements,
    };
  }
}