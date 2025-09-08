import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Book,
  BookOpen,
  Megaphone,
  Home,
  User,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string;
  description?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and insights'
  },
  {
    label: 'Create Book',
    href: '/create',
    icon: Book,
    description: 'Generate new books',
    badge: 'New'
  },
  {
    label: 'AI Assistant',
    href: '/intelligent-assistant',
    icon: Zap,
    description: 'Intelligent book generation',
    badge: 'AI'
  },
  {
    label: 'My Books',
    href: '/books',
    icon: BookOpen,
    description: 'Manage your library'
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['admin', 'marketer'],
    description: 'Performance metrics'
  },
  {
    label: 'Publish',
    href: '/publish',
    icon: Megaphone,
    description: 'Launch your books'
  },
  {
    label: 'Account',
    href: '/account',
    icon: User,
    description: 'Profile & settings'
  }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const canAccessRoute = (item: NavItem) => {
    // Check role-based access
    if (item.roles && (!user || !item.roles.includes(user.role))) {
      return false;
    }
    
    // Check feature-based access for guests
    if (user?.role === 'guest') {
      if (item.href === '/create' || item.href === '/analytics') {
        return false;
      }
    }
    
    return true;
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'marketer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'author':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'marketer':
        return <TrendingUp className="h-3 w-3" />;
      case 'author':
        return <BookOpen className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-gray-200 bg-white shadow-xl transition-all duration-300 ease-in-out md:hidden',
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Enhanced Logo/Brand */}
          <div className="flex h-20 items-center border-b border-gray-200 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900">ForgeKDP</h1>
                <p className="text-xs text-gray-600 -mt-1">Book Publishing Platform</p>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                Navigation
              </h2>
            </div>
            {navItems.map((item) => {
              if (!canAccessRoute(item)) {
                return null;
              }

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive: isCurrentRoute }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 relative',
                      isCurrentRoute
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:border-r-2 hover:border-blue-200'
                    )
                  }
                >
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200',
                    isActive(item.href) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Enhanced Bottom section */}
          <div className="mt-auto border-t border-gray-200">
            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {/* {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()} */}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.username || user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getRoleIcon(user.role)}
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs font-medium", getRoleColor(user.role))}
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Collapse button */}
            <div className="p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Close Menu
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Enhanced Desktop Sidebar */}
      <aside
        className={cn(
          'relative h-full border-r border-gray-200 bg-white transition-all duration-300 ease-in-out hidden md:block shadow-sm',
          sidebarCollapsed ? 'w-20' : 'w-72'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Enhanced Logo/Brand */}
          <div className={cn(
            "flex h-20 items-center border-b border-gray-200 px-6 bg-gradient-to-r from-blue-50 to-indigo-50",
            sidebarCollapsed ? "justify-center" : ""
          )}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-gray-900">ForgeKDP</h1>
                  <p className="text-xs text-gray-600 -mt-1">Book Publishing Platform</p>
                </div>
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {!sidebarCollapsed && (
              <div className="mb-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Navigation
                </h2>
              </div>
            )}
            {navItems.map((item) => {
              if (!canAccessRoute(item)) {
                return null;
              }

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                                     className={({ isActive: isCurrentRoute }) =>
                     cn(
                       'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 relative',
                       isCurrentRoute
                         ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                         : 'text-gray-700 hover:border-r-2 hover:border-blue-200',
                       sidebarCollapsed && 'justify-center px-2'
                     )
                   }
                  title={sidebarCollapsed ? `${item.label}${item.description ? ` - ${item.description}` : ''}` : undefined}
                >
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200',
                    isActive(item.href) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Enhanced Bottom section */}
          <div className="mt-auto border-t border-gray-200">
            {/* User info (collapsed) */}
            {sidebarCollapsed && user && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {(user.name || user?.username || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Collapse button */}
            <div className="p-4">
              <Button
                variant="ghost"
                size={sidebarCollapsed ? 'icon' : 'sm'}
                onClick={toggleSidebar}
                className={cn(
                  'w-full transition-all duration-200',
                  sidebarCollapsed ? 'px-2 h-10' : 'justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Collapse Menu
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
