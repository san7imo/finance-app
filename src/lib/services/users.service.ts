// src/lib/services/users.service.ts
import prisma from '@/lib/prisma';
import { User, Role } from '@prisma/client';

export interface UpdateUserDto {
  name?: string;
  role?: Role;
}

export interface UserFilters {
  role?: Role;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  _count: {
    movements: number;
  };
}

export interface PaginatedUsers {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UsersService {
  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  static async getUsers(filters: UserFilters = {}): Promise<PaginatedUsers> {
    const {
      role,
      search,
      page = 1,
      limit = 10,
    } = filters;

    // Construir condiciones de filtro
    const where: {
      role?: Role;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Contar total de registros
    const total = await prisma.user.count({ where });

    // Obtener usuarios con paginación
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            movements: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // ADMIN primero
        { name: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un usuario por ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  /**
   * Actualizar un usuario
   */
  static async updateUser(
    id: string,
    data: UpdateUserDto
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return user;
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getUserStats(): Promise<{
    totalUsers: number;
    adminCount: number;
    userCount: number;
  }> {
    const [totalUsers, adminCount, userCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { role: Role.USER } }),
    ]);

    return {
      totalUsers,
      adminCount,
      userCount,
    };
  }

  /**
   * Verificar si un usuario puede ser eliminado/modificado
   */
  static async canModifyUser(userId: string, currentUserId: string): Promise<boolean> {
    // No puede modificarse a sí mismo
    if (userId === currentUserId) {
      return false;
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return !!user;
  }
}