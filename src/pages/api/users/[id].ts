// src/pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { UsersService } from '@/lib/services/users.service';
import { validateUserUpdateData, sanitizeUserData } from '@/lib/utils/validation';

async function getUser(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'Se requiere un ID válido',
      });
    }

    const user = await UsersService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: 'El usuario solicitado no existe',
      });
    }

    // No enviar información sensible
    const { ...userData } = user;
    delete (userData as Partial<typeof userData>).emailVerified;

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el usuario',
    });
  }
}

async function updateUser(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'Se requiere un ID válido',
      });
    }

    // Verificar que el usuario existe y puede ser modificado
    const canModify = await UsersService.canModifyUser(id, req.user.id);
    if (!canModify) {
      return res.status(403).json({
        success: false,
        error: 'Operación no permitida',
        message: 'No puede modificar este usuario',
      });
    }

    // Validar datos de entrada
    const validation = validateUserUpdateData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.errors,
      });
    }

    // Sanitizar datos
    const sanitizedData = sanitizeUserData(req.body);

    // Actualizar el usuario
    const updatedUser = await UsersService.updateUser(id, sanitizedData);

    // No enviar información sensible
    const { ...userData } = updatedUser;
    delete (userData as Partial<typeof userData>).emailVerified;

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userData,
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el usuario',
    });
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case 'GET':
      return withAdminAuth(getUser)(req, res);
    case 'PUT':
      return withAdminAuth(updateUser)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({
        success: false,
        error: 'Método no permitido',
        message: `El método ${req.method} no está permitido en esta ruta`,
      });
  }
}

export default handler;