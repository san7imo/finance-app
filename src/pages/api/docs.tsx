// src/pages/api/docs.ts
import { NextApiRequest, NextApiResponse } from 'next';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Finance App API',
    version: '1.0.0',
    description: 'API para gestión de ingresos y egresos financieros',
    contact: {
      name: 'Finance App Team',
      email: 'support@financeapp.com'
    }
  },
  servers: [
    {
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      description: 'Servidor de desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
        description: 'Autenticación basada en sesión de NextAuth'
      }
    },
    schemas: {
      Movement: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único del movimiento'
          },
          concept: {
            type: 'string',
            description: 'Descripción del movimiento'
          },
          amount: {
            type: 'number',
            description: 'Monto del movimiento (positivo para ingresos, negativo para egresos)'
          },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha del movimiento'
          },
          userId: {
            type: 'string',
            description: 'ID del usuario que creó el movimiento'
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', nullable: true },
              email: { type: 'string' }
            }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único del usuario'
          },
          name: {
            type: 'string',
            nullable: true,
            description: 'Nombre del usuario'
          },
          email: {
            type: 'string',
            description: 'Correo electrónico del usuario'
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'USER'],
            description: 'Rol del usuario'
          }
        }
      },
      CreateMovement: {
        type: 'object',
        required: ['concept', 'amount'],
        properties: {
          concept: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            description: 'Descripción del movimiento'
          },
          amount: {
            type: 'number',
            description: 'Monto del movimiento (positivo para ingresos, negativo para egresos)'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Fecha del movimiento (opcional, por defecto fecha actual)'
          }
        }
      },
      UpdateUser: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            description: 'Nuevo nombre del usuario'
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'USER'],
            description: 'Nuevo rol del usuario'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            description: 'Mensaje de error'
          },
          message: {
            type: 'string',
            description: 'Descripción detallada del error'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            },
            description: 'Detalles específicos de errores de validación'
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Página actual'
          },
          limit: {
            type: 'integer',
            description: 'Límite de elementos por página'
          },
          total: {
            type: 'integer',
            description: 'Total de elementos'
          },
          totalPages: {
            type: 'integer',
            description: 'Total de páginas'
          }
        }
      },
      ReportsData: {
        type: 'object',
        properties: {
          balance: {
            type: 'number',
            description: 'Balance total actual'
          },
          totalIncome: {
            type: 'number',
            description: 'Total de ingresos'
          },
          totalExpenses: {
            type: 'number',
            description: 'Total de egresos'
          },
          totalMovements: {
            type: 'integer',
            description: 'Cantidad total de movimientos'
          },
          monthlyData: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string' },
                year: { type: 'integer' },
                income: { type: 'number' },
                expenses: { type: 'number' },
                balance: { type: 'number' },
                movementsCount: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/movements': {
      get: {
        summary: 'Obtener lista de movimientos',
        description: 'Obtiene una lista paginada de movimientos con filtros opcionales',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Número de página'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: 'Elementos por página'
          },
          {
            name: 'concept',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtrar por concepto'
          },
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtrar por usuario (solo administradores)'
          },
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de inicio para filtrar'
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de fin para filtrar'
          }
        ],
        responses: {
          200: {
            description: 'Lista de movimientos obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movement' }
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          },
          401: {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Crear nuevo movimiento',
        description: 'Crea un nuevo movimiento financiero (solo administradores)',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMovement' }
            }
          }
        },
        responses: {
          201: {
            description: 'Movimiento creado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Movement' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          403: {
            description: 'Acceso denegado (requiere rol ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/movements/{id}': {
      get: {
        summary: 'Obtener movimiento por ID',
        description: 'Obtiene un movimiento específico por su ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID del movimiento'
          }
        ],
        responses: {
          200: {
            description: 'Movimiento encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Movement' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Movimiento no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      put: {
        summary: 'Actualizar movimiento',
        description: 'Actualiza un movimiento existente (solo administradores)',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID del movimiento'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMovement' }
            }
          }
        },
        responses: {
          200: {
            description: 'Movimiento actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Movement' }
                  }
                }
              }
            }
          },
          403: {
            description: 'Acceso denegado (requiere rol ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Movimiento no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Eliminar movimiento',
        description: 'Elimina un movimiento existente (solo administradores)',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID del movimiento'
          }
        ],
        responses: {
          200: {
            description: 'Movimiento eliminado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          403: {
            description: 'Acceso denegado (requiere rol ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Movimiento no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/users': {
      get: {
        summary: 'Obtener lista de usuarios',
        description: 'Obtiene una lista paginada de usuarios (solo administradores)',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Número de página'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: 'Elementos por página'
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Buscar por nombre o email'
          },
          {
            name: 'role',
            in: 'query',
            schema: { type: 'string', enum: ['ADMIN', 'USER'] },
            description: 'Filtrar por rol'
          }
        ],
        responses: {
          200: {
            description: 'Lista de usuarios obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' }
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          },
          403: {
            description: 'Acceso denegado (requiere rol ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        summary: 'Obtener usuario por ID',
        description: 'Obtiene un usuario específico por su ID (solo administradores)',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID del usuario'
          }
        ],
        responses: {
          200: {
            description: 'Usuario encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          403: {
            description: 'Acceso denegado (requiere rol ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      put: {
        summary: 'Actualizar usuario',
        description: 'Actualiza un usuario existente (solo administradores)',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID del usuario'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUser' }
            }
          }
        },
        responses: {
          200: {
            description: 'Usuario actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          403: {
            description: 'Acceso denegado (requiere rol ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/reports': {
      get: {
        summary: 'Obtener datos de reportes',
        description: 'Obtiene datos estadísticos y gráficos financieros (solo administradores)',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'months',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 24, default: 6 },
            description: 'Número de meses atrás para incluir en el reporte'
          }
        ],
        responses: {
          200: {
            description: 'Datos de reportes obtenidos exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ReportsData' }
                  }
                }
              }
            }
          },
          403: {
            description: 'Acceso denegado (requiere rol ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/reports/csv': {
      get: {
        summary: 'Descargar reporte en CSV',
        description: 'Descarga un archivo CSV con todos los movimientos (solo administradores)',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Archivo CSV descargado exitosamente',
            content: {
              'text/csv': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          403: {
            description: 'Acceso denegado (requiere rol ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Movements',
      description: 'Operaciones relacionadas con movimientos financieros'
    },
    {
      name: 'Users',
      description: 'Operaciones relacionadas con usuarios'
    },
    {
      name: 'Reports',
      description: 'Operaciones relacionadas con reportes y estadísticas'
    }
  ]
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(openApiSpec);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: 'Método no permitido',
      message: `El método ${req.method} no está permitido en esta ruta`,
    });
  }
}