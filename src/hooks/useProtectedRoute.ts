// src/hooks/useProtectedRoute.ts
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Role } from '@prisma/client';

interface UseProtectedRouteOptions {
  allowedRoles?: Role[];
  redirectTo?: string;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    allowedRoles = ['ADMIN', 'USER'],
    redirectTo = '/auth/signin'
  } = options;

  useEffect(() => {
    if (status === 'loading') return; // Aún cargando

    // Si no hay sesión, redirigir al login
    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Si hay roles específicos requeridos, verificar permisos
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      // Redirigir a página de acceso denegado o home
      router.push('/');
      return;
    }
  }, [session, status, router, allowedRoles, redirectTo]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    hasRole: (role: Role) => session?.user.role === role,
    isAdmin: session?.user.role === 'ADMIN',
    user: session?.user
  };
}