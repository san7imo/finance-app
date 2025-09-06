// src/lib/utils/validation.ts
import { Role } from '@prisma/client';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos para datos de entrada
export interface MovementInput {
  concept?: unknown;
  amount?: unknown;
  date?: unknown;
}

export interface UserUpdateInput {
  name?: unknown;
  role?: unknown;
}

// Tipos de retorno para funciones de sanitización
export interface SanitizedMovementData {
  concept: string;
  amount: number;
  date: Date;
}

// CORREGIDO: Cambiar el tipo para que coincida con UpdateUserDto
export interface SanitizedUserData {
  name?: string;  // Removido | null
  role?: Role;
}

/**
 * Validador para crear/actualizar movimientos
 */
export function validateMovementData(data: MovementInput): ValidationResult {
  const errors: ValidationError[] = [];

  // Validar concepto
  if (!data.concept || typeof data.concept !== 'string') {
    errors.push({
      field: 'concept',
      message: 'El concepto es requerido y debe ser una cadena de texto',
    });
  } else if (data.concept.trim().length < 3) {
    errors.push({
      field: 'concept',
      message: 'El concepto debe tener al menos 3 caracteres',
    });
  } else if (data.concept.trim().length > 255) {
    errors.push({
      field: 'concept',
      message: 'El concepto no puede tener más de 255 caracteres',
    });
  }

  // Validar monto
  if (data.amount === undefined || data.amount === null) {
    errors.push({
      field: 'amount',
      message: 'El monto es requerido',
    });
  } else if (typeof data.amount !== 'number') {
    errors.push({
      field: 'amount',
      message: 'El monto debe ser un número',
    });
  } else if (isNaN(data.amount)) {
    errors.push({
      field: 'amount',
      message: 'El monto debe ser un número válido',
    });
  } else if (data.amount === 0) {
    errors.push({
      field: 'amount',
      message: 'El monto no puede ser cero',
    });
  }

  // Validar fecha (opcional)
  if (data.date !== undefined && data.date !== null) {
    const date = new Date(data.date as string);
    if (isNaN(date.getTime())) {
      errors.push({
        field: 'date',
        message: 'La fecha debe ser válida',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validador para actualizar usuarios
 */
export function validateUserUpdateData(data: UserUpdateInput): ValidationResult {
  const errors: ValidationError[] = [];

  // Validar nombre (opcional)
  if (data.name !== undefined && data.name !== null) {
    if (typeof data.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'El nombre debe ser una cadena de texto',
      });
    } else if (data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'El nombre debe tener al menos 2 caracteres',
      });
    } else if (data.name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'El nombre no puede tener más de 100 caracteres',
      });
    }
  }

  // Validar rol (opcional)
  if (data.role !== undefined && data.role !== null) {
    if (!Object.values(Role).includes(data.role as Role)) {
      errors.push({
        field: 'role',
        message: 'El rol debe ser ADMIN o USER',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizar datos de entrada
 */
export function sanitizeMovementData(data: MovementInput): SanitizedMovementData {
  return {
    concept: typeof data.concept === 'string' ? data.concept.trim() : '',
    amount: typeof data.amount === 'number' ? data.amount : 0,
    date: data.date ? new Date(data.date as string) : new Date(),
  };
}

/**
 * Sanitizar datos de usuario
 * CORREGIDO: Manejar null values correctamente
 */
export function sanitizeUserData(data: UserUpdateInput): SanitizedUserData {
  const sanitized: SanitizedUserData = {};

  if (data.name !== undefined) {
    // Si name es null o string vacío, no lo incluimos en el objeto
    // Si es string válido, lo trimmeamos
    if (typeof data.name === 'string' && data.name.trim().length > 0) {
      sanitized.name = data.name.trim();
    }
    // Si name es null o string vacío, simplemente no agregamos la propiedad
  }

  if (data.role !== undefined) {
    sanitized.role = data.role as Role;
  }

  return sanitized;
}