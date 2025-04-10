import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, Search as SearchIcon, Sun, Moon, User, Music, LogOut, 
  Book, Command, ChevronDown, Bell
} from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useAuth } from '../../../core/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../../../core/components/ui/dropdown-menu';
import CommandSearch from '../../search/components/CommandSearch';
import { Badge } from '../../../core/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../core/components/ui/avatar';

interface NavbarProps {
  toggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Track scroll for sticky header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Match MuseScore current page indicator
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header 
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and main nav */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            {toggleSidebar && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 lg:hidden" 
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <Music className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">ThanhCaPDF</span>
            </Link>
            
            {/* Main navigation - desktop */}
            <nav className="hidden md:flex ml-8 space-x-1">
              <Link 
                to="/hymns"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/hymns') 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400'
                }`}
              >
                Thánh ca
              </Link>
              <Link 
                to="/themes"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/themes') 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400'
                }`}
              >
                Chủ đề
              </Link>
              <Link 
                to="/authors"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/authors') 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400'
                }`}
              >
                Tác giả
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/resources') 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Tài nguyên
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link to="/resources/videos" className="flex w-full">
                      Videos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/resources/audios" className="flex w-full">
                      Audio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/resources/presentations" className="flex w-full">
                      Trình chiếu
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link 
                to="/community"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/community') 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400'
                }`}
              >
                Cộng đồng
              </Link>
            </nav>
          </div>
          
          {/* Right Side - Search and user menu */}
          <div className="flex items-center space-x-2">
            {/* Search button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-700 dark:text-gray-300 hidden sm:flex"
              onClick={toggleSearch}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              <span className="mr-1">Tìm kiếm</span>
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1.5 font-mono text-xs font-medium text-gray-800 dark:text-gray-300">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            
            <Button 
              variant="ghost"
              size="icon" 
              className="sm:hidden"
              onClick={toggleSearch}
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
            
            {/* Theme toggle */}
            <Button 
              variant="ghost"
              size="icon" 
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* User dropdown or login button */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative" aria-label="User menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl || ''} alt={user?.displayName || 'User'} />
                      <AvatarFallback>
                        {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.displayName && (
                        <p className="font-medium">{user.displayName}</p>
                      )}
                      {user?.email && (
                        <p className="w-[200px] truncate text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Hồ sơ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">
                      <Music className="mr-2 h-4 w-4" />
                      <span>Thánh ca yêu thích</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button>Đăng nhập</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Command Search Dialog */}
      <CommandSearch 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
      />
    </header>
  );
};

export default Navbar;
