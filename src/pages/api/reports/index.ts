// src/pages/api/reports/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { ReportsService } from '@/lib/services/reports.service';

async function getReports(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  try {
    const { months = '6' } = req.query;
    
    const monthsNumber = parseInt(months as string, 10);
    if (isNaN(monthsNumber) || monthsNumber < 1 || monthsNumber > 24) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro inválido',
        message: 'Los meses deben ser un número entre 1 y 24',
      });
    }

    const reportsData = await ReportsService.getReportsData(monthsNumber);

    res.status(200).json({
      success: true,
      data: reportsData,
    });
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los reportes',
    });
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case 'GET':
      return withAdminAuth(getReports)(req, res);
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