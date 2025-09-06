// src/pages/api/movements/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withUserAuth, withAdminAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { MovementsService } from '@/lib/services/movements.service';
import { validateMovementData, sanitizeMovementData } from '@/lib/utils/validation';

async function getMovements(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const {
      page = '1',
      limit = '10',
      userId,
      startDate,
      endDate,
      concept,
    } = req.query;

    const filters = {
      page: parseInt(page as string, 10),
      limit: Math.min(parseInt(limit as string, 10), 100), // Máximo 100 registros por página
      userId: userId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      concept: concept as string,
    };

    // Si el usuario no es ADMIN, solo puede ver sus propios movimientos
    if (req.user.role !== 'ADMIN') {
      filters.userId = req.user.id;
    }

    const result = await MovementsService.getMovements(filters);

    res.status(200).json({
      success: true,
      data: result.movements,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los movimientos',
    });
  }
}

async function createMovement(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Validar datos de entrada
    const validation = validateMovementData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.errors,
      });
    }

    // Sanitizar datos
    const sanitizedData = sanitizeMovementData(req.body);

    // Crear el movimiento
    const movement = await MovementsService.createMovement(
      req.user.id,
      sanitizedData
    );

    res.status(201).json({
      success: true,
      message: 'Movimiento creado exitosamente',
      data: movement,
    });
  } catch (error) {
    console.error('Error creando movimiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo crear el movimiento',
    });
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withUserAuth(getMovements)(req, res);
    case 'POST':
      return withAdminAuth(createMovement)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        error: 'Método no permitido',
        message: `El método ${req.method} no está permitido en esta ruta`,
      });
  }
}

export default handler;