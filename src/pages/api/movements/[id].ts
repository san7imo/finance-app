// src/pages/api/movements/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withUserAuth, withAdminAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { MovementsService } from '@/lib/services/movements.service';
import { validateMovementData } from '@/lib/utils/validation';

async function getMovement(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'Se requiere un ID válido',
      });
    }

    const movement = await MovementsService.getMovementById(id);

    if (!movement) {
      return res.status(404).json({
        success: false,
        error: 'Movimiento no encontrado',
        message: 'El movimiento solicitado no existe',
      });
    }

    // Si el usuario no es ADMIN, solo puede ver sus propios movimientos
    if (req.user.role !== 'ADMIN' && movement.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado',
        message: 'No tiene permisos para ver este movimiento',
      });
    }

    res.status(200).json({
      success: true,
      data: movement,
    });
  } catch (error) {
    console.error('Error obteniendo movimiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el movimiento',
    });
  }
}

async function updateMovement(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'Se requiere un ID válido',
      });
    }

    // Verificar que el movimiento existe
    const existingMovement = await MovementsService.getMovementById(id);
    if (!existingMovement) {
      return res.status(404).json({
        success: false,
        error: 'Movimiento no encontrado',
        message: 'El movimiento solicitado no existe',
      });
    }

    // Validar datos de entrada (para actualización, todos los campos son opcionales)
    const validation = validateMovementData({
      concept: req.body.concept || existingMovement.concept,
      amount: req.body.amount ?? existingMovement.amount,
      date: req.body.date || existingMovement.date,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.errors,
      });
    }

    // Sanitizar solo los campos que se están actualizando
    const updateData: Partial<{
      concept: string;
      amount: number;
      date: Date;
    }> = {};

    if (req.body.concept !== undefined) {
      updateData.concept = req.body.concept.trim();
    }
    if (req.body.amount !== undefined) {
      updateData.amount = req.body.amount;
    }
    if (req.body.date !== undefined) {
      updateData.date = new Date(req.body.date);
    }

    // Actualizar el movimiento
    const updatedMovement = await MovementsService.updateMovement(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Movimiento actualizado exitosamente',
      data: updatedMovement,
    });
  } catch (error) {
    console.error('Error actualizando movimiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el movimiento',
    });
  }
}

async function deleteMovement(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'Se requiere un ID válido',
      });
    }

    // Verificar que el movimiento existe
    const existingMovement = await MovementsService.getMovementById(id);
    if (!existingMovement) {
      return res.status(404).json({
        success: false,
        error: 'Movimiento no encontrado',
        message: 'El movimiento solicitado no existe',
      });
    }

    // Eliminar el movimiento
    await MovementsService.deleteMovement(id);

    res.status(200).json({
      success: true,
      message: 'Movimiento eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando movimiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el movimiento',
    });
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withUserAuth(getMovement)(req, res);
    case 'PUT':
      return withAdminAuth(updateMovement)(req, res);
    case 'DELETE':
      return withAdminAuth(deleteMovement)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({
        success: false,
        error: 'Método no permitido',
        message: `El método ${req.method} no está permitido en esta ruta`,
      });
  }
}

export default handler;