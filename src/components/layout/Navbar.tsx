import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, Languages, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/shared/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from 'react-i18next';

const navLinks = [
  { key: 'nav_home', href: '/' },
  { key: 'nav_news', href: '/news' },
  { key: 'nav_events', href: '/events' },
  { key: 'nav_jobs', href: '/jobs' },
  { key: 'nav_matrimony', href: '/matrimony' },
  { key: 'nav_directory', href: '/directory' },
  { key: 'nav_chat', href: '/chat' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display text-xl text-primary-foreground font-bold">न</span>
            </div>
            <span className="font-display text-xl font-semibold hidden sm:block">Nagar Samaj</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      {t('nav_admin')}
                    </Button>
                  </Link>
                )}
                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-muted-foreground">{user?.name}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Languages className="w-4 h-4 mr-2" />
                        <span>{t('profile_language')}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => {
                          i18n.changeLanguage('en');
                          localStorage.setItem('app-language', 'en');
                        }}>
                          <span>English</span>
                          {i18n.language === 'en' && <Check className="w-4 h-4 ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          i18n.changeLanguage('hi');
                          localStorage.setItem('app-language', 'hi');
                        }}>
                          <span>हिंदी (Hindi)</span>
                          {i18n.language === 'hi' && <Check className="w-4 h-4 ml-auto" />}
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>{t('profile_logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('login_button')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="default" size="sm" className="btn-gold">
                    {t('nav_join_community')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border/50 overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.key}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive(link.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                  >
                    {t(link.key)}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border/50 mt-4">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{user?.name}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {user?.isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 px-4">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full btn-gold">
                          Join Community
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}