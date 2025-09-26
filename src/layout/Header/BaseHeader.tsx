import React from 'react';
import { 
  Menu, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  BookOpen,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/redux/hooks/useAuth';
import { useUI } from '@/redux/hooks/useUI';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, toggleSidebar } = useUI();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left section - Mobile Menu and Search */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden h-9 w-9 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg hover:bg-gray-100"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                    {user?.full_name ? getInitials(user.full_name) : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-0">
              {/* User Info Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                        {user?.full_name ? getInitials(user.full_name) : <User className="h-6 w-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || user?.email}</p>
                      <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getRoleIcon(user?.role || '')}
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs font-medium", getRoleColor(user?.role || ''))}
                        >
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </div>


              {/* Development Section */}
              {/* <div className="p-2">
                <DropdownMenuLabel className="text-xs font-medium text-gray-500 px-3 py-2">
                  Development Tools
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-sm"
                  onClick={() => window.location.reload()}
                >
                  <div className="h-6 w-6 rounded bg-orange-100 flex items-center justify-center">
                    <Shield className="h-3 w-3 text-orange-600" />
                  </div>
                  <span>Switch to Admin Role</span>
                </DropdownMenuItem>
              </div> */}

              <DropdownMenuSeparator />

              {/* Logout */}
              <div className="p-2">
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-700 hover:text-red-800"
                >
                  <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sign out</p>
                    <p className="text-xs text-red-500">End your session</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
