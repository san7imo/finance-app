// src/pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { UsersService } from '@/lib/services/users.service';
import { Role } from '@prisma/client';

async function getUsers(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  try {
    const {
      page = '1',
      limit = '10',
      role,
      search,
    } = req.query;

    const filters = {
      page: parseInt(page as string, 10),
      limit: Math.min(parseInt(limit as string, 10), 100), // Máximo 100 registros por página
      role: role as Role | undefined,
      search: search as string | undefined,
    };

    const result = await UsersService.getUsers(filters);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los usuarios',
    });
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case 'GET':
      return withAdminAuth(getUsers)(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({
        success: false,
        error: 'Método no permitido',
        message: `El método ${req.method} no está permitido en esta ruta`,
      });
  }
}

export default handler;