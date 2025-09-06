// src/pages/api/reports/csv.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { ReportsService } from '@/lib/services/reports.service';

async function downloadCSV(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  try {
    // Obtener datos de movimientos
    const movementsData = await ReportsService.getMovementsForCSV();

    // Generar CSV
    const csvContent = ReportsService.generateCSV(movementsData);

    // Configurar headers para descarga
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `reporte-movimientos-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Agregar BOM para Excel
    const bom = '\uFEFF';
    res.status(200).send(bom + csvContent);
  } catch (error) {
    console.error('Error generando CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo generar el archivo CSV',
    });
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case 'GET':
      return withAdminAuth(downloadCSV)(req, res);
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