import React, { useState } from 'react';
import { 
  Bell, 
  Menu, 
  Moon, 
  Sun, 
  User, 
  Settings, 
  LogOut, 
  Search,
  BookOpen,
  TrendingUp,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, toggleSidebar, notifications } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;



  const getInitials = (name: string) => {
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
          
          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search books, campaigns, analytics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "pl-10 pr-4 h-10 border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-200",
                  isSearchFocused && "ring-2 ring-blue-500/20 border-blue-300 bg-white"
                )}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-gray-100"
                >
                  <span className="sr-only">Clear search</span>
                  <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">×</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 rounded-lg hover:bg-gray-100"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-medium border-2 border-white flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="p-4 border-b border-gray-100">
                <DropdownMenuLabel className="text-base font-semibold text-gray-900">
                  Notifications
                </DropdownMenuLabel>
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-start p-4 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                {notifications.length === 0 && (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No notifications yet</p>
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="w-full text-sm">
                    View all notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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

          {/* Help */}
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-gray-100"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                    {user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}
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
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                        {user?.name ? getInitials(user.name) : <User className="h-6 w-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
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

              {/* Menu Items */}
              <DropdownMenuGroup className="p-2">
                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Profile</p>
                    <p className="text-xs text-gray-500">Manage your account</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Settings</p>
                    <p className="text-xs text-gray-500">Preferences & configuration</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Documentation</p>
                    <p className="text-xs text-gray-500">Help & guides</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Development Section */}
              <div className="p-2">
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
              </div>

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
