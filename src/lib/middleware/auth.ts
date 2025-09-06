// src/lib/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
    role: Role;
    name?: string | null;
    image?: string | null;
  };
}

export type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

export type MiddlewareOptions = {
  requireAuth?: boolean;
  allowedRoles?: Role[];
};

/**
 * Middleware para manejar autenticación y autorización en API routes
 */
export function withAuth(
  handler: ApiHandler,
  options: MiddlewareOptions = { requireAuth: true }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Si no se requiere autenticación, ejecutar el handler directamente
      if (!options.requireAuth) {
        return await handler(req as AuthenticatedRequest, res);
      }

      // Obtener la sesión del usuario
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Debe iniciar sesión para acceder a este recurso',
        });
      }

      // Verificar roles si se especificaron
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        if (!options.allowedRoles.includes(session.user.role)) {
          return res.status(403).json({
            error: 'Acceso denegado',
            message: 'No tiene permisos para acceder a este recurso',
            requiredRoles: options.allowedRoles,
            userRole: session.user.role,
          });
        }
      }

      // Agregar el usuario a la request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = session.user;

      // Ejecutar el handler
      return await handler(authenticatedReq, res);
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error procesando la solicitud',
      });
    }
  };
}

/**
 * Decorador específico para rutas que solo pueden acceder administradores
 */
export function withAdminAuth(handler: ApiHandler) {
  return withAuth(handler, {
    requireAuth: true,
    allowedRoles: [Role.ADMIN],
  });
}

/**
 * Decorador para rutas que requieren autenticación pero permiten cualquier rol
 */
export function withUserAuth(handler: ApiHandler) {
  return withAuth(handler, {
    requireAuth: true,
    allowedRoles: [Role.ADMIN, Role.USER],
  });
}