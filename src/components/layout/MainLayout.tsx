// src/components/layout/MainLayout.tsx
import { ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  TrendingUp, 
  Users, 
  BarChart3, 
  LogOut,
  DollarSign
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const navigation = [
    {
      name: 'Inicio',
      href: '/',
      icon: Home,
      allowedRoles: ['ADMIN', 'USER']
    },
    {
      name: 'Movimientos',
      href: '/movements',
      icon: TrendingUp,
      allowedRoles: ['ADMIN', 'USER']
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: Users,
      allowedRoles: ['ADMIN']
    },
    {
      name: 'Reportes',
      href: '/reports',
      icon: BarChart3,
      allowedRoles: ['ADMIN']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.allowedRoles.includes(session?.user?.role || 'USER')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Finance App
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session?.user?.name || session?.user?.email}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {session?.user?.role}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <Card className="p-4">
              <nav className="space-y-2">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;