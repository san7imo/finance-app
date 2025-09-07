// src/pages/movements/index.tsx
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Movement {
  id: string;
  concept: string;
  amount: number;
  date: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface MovementFormData {
  concept: string;
  amount: string;
  date: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ValidationDetail {
  message: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  details?: ValidationDetail[];
  data?: Movement[];
  pagination?: PaginationInfo;
}

const MovementsPage = () => {
  const { isLoading, isAdmin } = useProtectedRoute();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [formData, setFormData] = useState<MovementFormData>({
    concept: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMovements = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search.trim()) {
        params.append('concept', search.trim());
      }

      const response = await fetch(`/api/movements?${params}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data && data.pagination) {
        setMovements(data.data);
        setPagination(data.pagination);
      } else {
        console.error('Error fetching movements:', data.error);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    if (!isLoading) {
      fetchMovements();
    }
  }, [isLoading, fetchMovements]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (!isLoading) {
        fetchMovements(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, isLoading, fetchMovements]);

  const handleFormChange = (field: keyof MovementFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.concept.trim()) {
      errors.push('El concepto es requerido');
    } else if (formData.concept.trim().length < 3) {
      errors.push('El concepto debe tener al menos 3 caracteres');
    }

    if (!formData.amount.trim()) {
      errors.push('El monto es requerido');
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) === 0) {
      errors.push('El monto debe ser un número válido diferente de cero');
    }

    if (!formData.date) {
      errors.push('La fecha es requerida');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (isEdit = false) => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        concept: formData.concept.trim(),
        amount: Number(formData.amount),
        date: formData.date
      };

      const url = isEdit && editingMovement 
        ? `/api/movements/${editingMovement.id}`
        : '/api/movements';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Refrescar la lista
        await fetchMovements(pagination.page, searchTerm);
        
        // Cerrar diálogos y limpiar formulario
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingMovement(null);
        setFormData({
          concept: '',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        });
        setFormErrors([]);
      } else {
        if (data.details && Array.isArray(data.details)) {
          setFormErrors(data.details.map((detail: ValidationDetail) => detail.message));
        } else {
          setFormErrors([data.error || 'Error desconocido']);
        }
      }
    } catch {
      setFormErrors(['Error de conexión. Intente nuevamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (movement: Movement) => {
    setEditingMovement(movement);
    setFormData({
      concept: movement.concept,
      amount: movement.amount.toString(),
      date: movement.date.split('T')[0]
    });
    setFormErrors([]);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (movement: Movement) => {
    if (!confirm(`¿Está seguro de eliminar el movimiento "${movement.concept}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/movements/${movement.id}`, {
        method: 'DELETE',
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchMovements(pagination.page, searchTerm);
      } else {
        alert(data.error || 'Error eliminando el movimiento');
      }
    } catch {
      alert('Error de conexión. Intente nuevamente.');
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchMovements(newPage, searchTerm);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Movimientos - Finance App</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Movimientos
            </h1>
            <p className="mt-2 text-gray-600">
              Administra tus ingresos y egresos
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Movimiento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Movimiento</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo ingreso o egreso al sistema
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {formErrors.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {formErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <Label htmlFor="concept">Concepto</Label>
                    <Input
                      id="concept"
                      value={formData.concept}
                      onChange={(e) => handleFormChange('concept', e.target.value)}
                      placeholder="Descripción del movimiento"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleFormChange('amount', e.target.value)}
                      placeholder="Ingrese monto (positivo para ingreso, negativo para egreso)"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Movimiento'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por concepto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos</CardTitle>
            <CardDescription>
              Lista de todos los movimientos financieros
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron movimientos
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario</TableHead>
                      {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">
                          {movement.concept}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {movement.amount > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={movement.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(movement.amount)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(movement.date)}</TableCell>
                        <TableCell>
                          {movement.user.name || movement.user.email}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(movement)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(movement)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} movimientos
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <span className="text-sm">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Movimiento</DialogTitle>
              <DialogDescription>
                Modifica los datos del movimiento seleccionado
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {formErrors.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="edit-concept">Concepto</Label>
                <Input
                  id="edit-concept"
                  value={formData.concept}
                  onChange={(e) => handleFormChange('concept', e.target.value)}
                  placeholder="Descripción del movimiento"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-amount">Monto</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                  placeholder="Ingrese monto (positivo para ingreso, negativo para egreso)"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-date">Fecha</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default MovementsPage;