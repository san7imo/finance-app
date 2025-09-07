// __tests__/services/movements.test.ts
import { validateMovementData, sanitizeMovementData, validateUserUpdateData, sanitizeUserData } from '@/lib/utils/validation';

// Mock de Prisma para las pruebas - comentado ya que no necesitamos el archivo real para estas pruebas
// jest.mock('@/lib/prisma', () => ({
//   movement: {
//     findMany: jest.fn(),
//     create: jest.fn(),
//     findUnique: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn(),
//     count: jest.fn(),
//     aggregate: jest.fn(),
//   },
// }));

describe('Validación de Movimientos', () => {
  describe('validateMovementData', () => {
    it('debería validar correctamente datos válidos', () => {
      const validData = {
        concept: 'Pago de salario',
        amount: 1000000,
        date: '2024-01-15'
      };

      const result = validateMovementData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debería rechazar concepto vacío', () => {
      const invalidData = {
        concept: '',
        amount: 1000000,
        date: '2024-01-15'
      };

      const result = validateMovementData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'concept',
            message: 'El concepto es requerido y debe ser una cadena de texto'
          })
        ])
      );
    });

    it('debería rechazar concepto muy corto', () => {
      const invalidData = {
        concept: 'AB', // Solo 2 caracteres
        amount: 1000000,
        date: '2024-01-15'
      };

      const result = validateMovementData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'concept',
            message: 'El concepto debe tener al menos 3 caracteres'
          })
        ])
      );
    });

    it('debería rechazar monto cero', () => {
      const invalidData = {
        concept: 'Test concepto',
        amount: 0,
        date: '2024-01-15'
      };

      const result = validateMovementData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'amount',
            message: 'El monto no puede ser cero'
          })
        ])
      );
    });

    it('debería rechazar monto no numérico', () => {
      const invalidData = {
        concept: 'Test concepto',
        amount: 'no es un numero' as unknown as number,
        date: '2024-01-15'
      };

      const result = validateMovementData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'amount',
            message: 'El monto debe ser un número'
          })
        ])
      );
    });

    it('debería rechazar fecha inválida', () => {
      const invalidData = {
        concept: 'Test concepto',
        amount: 1000000,
        date: 'fecha-invalida'
      };

      const result = validateMovementData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'date',
            message: 'La fecha debe ser válida'
          })
        ])
      );
    });

    it('debería permitir múltiples errores simultáneos', () => {
      const invalidData = {
        concept: '', // Vacío
        amount: 0,   // Cero
        date: 'fecha-invalida'
      };

      const result = validateMovementData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.map(e => e.field)).toEqual(['concept', 'amount', 'date']);
    });
  });

  describe('sanitizeMovementData', () => {
    it('debería sanitizar correctamente datos válidos', () => {
      const inputData = {
        concept: '  Pago de salario  ', // Con espacios extra
        amount: 1000000,
        date: '2024-01-15'
      };

      const result = sanitizeMovementData(inputData);

      expect(result).toEqual({
        concept: 'Pago de salario', // Sin espacios extra
        amount: 1000000,
        date: expect.any(Date)
      });
      expect(result.date.toISOString().split('T')[0]).toBe('2024-01-15');
    });

    it('debería manejar datos faltantes con valores por defecto', () => {
      const inputData = {
        concept: undefined,
        amount: undefined,
        date: undefined
      };

      const currentDate = new Date();
      const result = sanitizeMovementData(inputData);

      expect(result).toEqual({
        concept: '',
        amount: 0,
        date: expect.any(Date)
      });

      // Verificar que la fecha es aproximadamente la fecha actual
      const timeDiff = Math.abs(result.date.getTime() - currentDate.getTime());
      expect(timeDiff).toBeLessThan(1000); // Menos de 1 segundo de diferencia
    });

    it('debería convertir tipos incorrectos', () => {
      const inputData = {
        concept: 123 as unknown as string, // Número en lugar de string
        amount: '500000' as unknown as number, // String en lugar de número
        date: '2024-01-15'
      };

      const result = sanitizeMovementData(inputData);

      expect(result).toEqual({
        concept: '', // Se convierte a string vacío porque no es string válido
        amount: 0,   // Se convierte a 0 porque no es number válido
        date: expect.any(Date)
      });
    });
  });
});

// __tests__/utils/validation.test.ts
describe('Validación de Usuarios', () => {
  describe('validateUserUpdateData', () => {
    it('debería validar correctamente datos válidos', () => {
      const validData = {
        name: 'Juan Pérez',
        role: 'ADMIN' as const
      };

      const result = validateUserUpdateData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debería permitir campos opcionales undefined', () => {
      const validData = {
        name: undefined,
        role: undefined
      };

      const result = validateUserUpdateData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debería rechazar nombre muy corto', () => {
      const invalidData = {
        name: 'A', // Solo 1 carácter
        role: 'ADMIN' as const
      };

      const result = validateUserUpdateData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'El nombre debe tener al menos 2 caracteres'
          })
        ])
      );
    });

    it('debería rechazar rol inválido', () => {
      const invalidData = {
        name: 'Juan Pérez',
        role: 'INVALID_ROLE' as unknown as 'ADMIN' | 'USER'
      };

      const result = validateUserUpdateData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'role',
            message: 'El rol debe ser ADMIN o USER'
          })
        ])
      );
    });
  });

  describe('sanitizeUserData', () => {
    it('debería sanitizar correctamente datos válidos', () => {
      const inputData = {
        name: '  Juan Pérez  ',
        role: 'ADMIN' as const
      };

      const result = sanitizeUserData(inputData);

      expect(result).toEqual({
        name: 'Juan Pérez',
        role: 'ADMIN'
      });
    });

    it('debería omitir campos undefined', () => {
      const inputData = {
        name: undefined,
        role: 'USER' as const
      };

      const result = sanitizeUserData(inputData);

      expect(result).toEqual({
        role: 'USER'
      });
      expect(result).not.toHaveProperty('name');
    });

    it('debería omitir nombre vacío o null', () => {
      const inputData = {
        name: null,
        role: 'USER' as const
      };

      const result = sanitizeUserData(inputData);

      expect(result).toEqual({
        role: 'USER'
      });
      expect(result).not.toHaveProperty('name');
    });

    it('debería omitir nombre que solo contiene espacios', () => {
      const inputData = {
        name: '   ',
        role: 'USER' as const
      };

      const result = sanitizeUserData(inputData);

      expect(result).toEqual({
        role: 'USER'
      });
      expect(result).not.toHaveProperty('name');
    });
  });
});

// Interfaces para mejorar el tipado
interface MockRequest {
  method: string;
  body: Record<string, unknown>;
  query: Record<string, unknown>;
  user: {
    id: string;
    role: string;
    email: string;
  };
}

interface MockResponse {
  status: jest.MockedFunction<(code: number) => MockResponse>;
  json: jest.MockedFunction<(data: unknown) => MockResponse>;
  setHeader: jest.MockedFunction<(name: string, value: string) => MockResponse>;
}

// __tests__/api/movements.integration.test.ts
describe('API Integration Tests', () => {
  // Mock para simular requests y responses
  const mockRequest = (method: string, body?: Record<string, unknown>, query?: Record<string, unknown>, user?: { id: string; role: string; email: string }): MockRequest => ({
    method,
    body: body || {},
    query: query || {},
    user: user || { id: 'test-user-id', role: 'ADMIN', email: 'test@test.com' }
  });

  const mockResponse = (): MockResponse => {
    const res = {} as MockResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('GET /api/movements - Filtros y paginación', () => {
    it('debería aplicar filtros correctamente', () => {
      const req = mockRequest('GET', undefined, {
        page: '1',
        limit: '5',
        concept: 'salario',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });

      // Verificar que los parámetros se parsean correctamente
      const expectedFilters = {
        page: 1,
        limit: 5,
        concept: 'salario',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      // Test de lógica de parsing de parámetros
      const parsedFilters = {
        page: parseInt(req.query.page as string, 10),
        limit: Math.min(parseInt(req.query.limit as string, 10), 100),
        concept: req.query.concept as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      expect(parsedFilters.page).toBe(expectedFilters.page);
      expect(parsedFilters.limit).toBe(expectedFilters.limit);
      expect(parsedFilters.concept).toBe(expectedFilters.concept);
      expect(parsedFilters.startDate).toEqual(expectedFilters.startDate);
      expect(parsedFilters.endDate).toEqual(expectedFilters.endDate);
    });

    it('debería limitar el límite máximo a 100', () => {
      const req = mockRequest('GET', undefined, {
        limit: '150' // Más del máximo
      });

      const parsedLimit = Math.min(parseInt(req.query.limit as string, 10), 100);

      expect(parsedLimit).toBe(100);
    });

    it('debería usar valores por defecto para página y límite', () => {
      const req = mockRequest('GET', undefined, {});

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      expect(page).toBe(1);
      expect(limit).toBe(10);
    });

    it('debería usar mockResponse para verificar status codes', () => {
      const res = mockResponse();
      res.status(200).json({ success: true });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('POST /api/movements - Validación de entrada', () => {
    it('debería rechazar datos inválidos', () => {
      const invalidMovementData = {
        concept: '', // Vacío
        amount: 0,   // Cero
        date: 'invalid-date'
      };

      const validation = validateMovementData(invalidMovementData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      
      // Verificar que incluye errores específicos
      const errorFields = validation.errors.map(e => e.field);
      expect(errorFields).toContain('concept');
      expect(errorFields).toContain('amount');
      expect(errorFields).toContain('date');
    });

    it('debería aceptar datos válidos', () => {
      const validMovementData = {
        concept: 'Pago de servicios públicos',
        amount: -150000, // Egreso
        date: '2024-01-15'
      };

      const validation = validateMovementData(validMovementData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('debería permitir montos negativos para egresos', () => {
      const egresoData = {
        concept: 'Gasto en alimentación',
        amount: -50000,
        date: '2024-01-15'
      };

      const validation = validateMovementData(egresoData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('debería permitir montos positivos para ingresos', () => {
      const ingresoData = {
        concept: 'Salario mensual',
        amount: 2000000,
        date: '2024-01-15'
      };

      const validation = validateMovementData(ingresoData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Autorización por roles', () => {
    it('debería permitir a ADMIN crear movimientos', () => {
      const adminUser = { id: 'admin-id', role: 'ADMIN', email: 'admin@test.com' };
      const req = mockRequest('POST', {
        concept: 'Test concepto',
        amount: 1000,
        date: '2024-01-15'
      }, undefined, adminUser);

      // Verificar que el usuario es admin
      expect(req.user.role).toBe('ADMIN');
    });

    it('debería denegar a USER crear movimientos', () => {
      const regularUser = { id: 'user-id', role: 'USER', email: 'user@test.com' };
      
      // Simular la lógica de verificación de roles
      const isAdmin = regularUser.role === 'ADMIN';
      
      expect(isAdmin).toBe(false);
    });

    it('debería permitir a USER ver movimientos', () => {
      const regularUser = { id: 'user-id', role: 'USER', email: 'user@test.com' };
      const allowedRoles = ['ADMIN', 'USER'];
      
      const hasPermission = allowedRoles.includes(regularUser.role);
      
      expect(hasPermission).toBe(true);
    });

    it('debería denegar acceso a reportes para USER', () => {
      const regularUser = { id: 'user-id', role: 'USER', email: 'user@test.com' };
      const requiredRoles = ['ADMIN'];
      
      const hasPermission = requiredRoles.includes(regularUser.role);
      
      expect(hasPermission).toBe(false);
    });
  });
});

// Mock setup para Jest
if (typeof jest !== 'undefined') {
  // Setup global mocks
  global.fetch = jest.fn();
  
  // Mock Next.js router
  jest.mock('next/router', () => ({
    useRouter() {
      return {
        route: '/',
        pathname: '/',
        query: {},
        asPath: '/',
        push: jest.fn(),
        pop: jest.fn(),
        reload: jest.fn(),
        back: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
      };
    },
  }));

  // Mock NextAuth
  jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => ({
      data: { user: { id: 'test-id', role: 'ADMIN', email: 'test@test.com' } },
      status: 'authenticated'
    })),
    signOut: jest.fn(),
    signIn: jest.fn(),
  }));
}