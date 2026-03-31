import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Box,
  Boxes,
  ShoppingCart, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { AnimatePresence, motion } from 'framer-motion';

const SidebarLink = ({ 
  to, 
  icon: Icon, 
  label, 
  isActive,
  onClick
}: { 
  to: string; 
  icon: any; 
  label: string; 
  isActive: boolean;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      isActive 
        ? "bg-amber-500 text-white shadow-lg" 
        : "text-neutral-500 hover:bg-amber-50 hover:text-amber-600"
    )}
  >
    <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-neutral-400 group-hover:text-amber-600")} />
    <span className="font-medium">{label}</span>
    {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
  </Link>
);

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAdminAuthStore(state => state.logout);
  const user = useAdminAuthStore(state => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileSidebarOpen]);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
    { to: '/dashboard/products', icon: Package, label: 'Products' },
    { to: '/dashboard/models', icon: Boxes, label: '3D Models' },
    { to: '/dashboard/studio', icon: Box, label: 'Studio' },
    { to: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const activeLabel = navItems.find(item => 
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label || 'Dashboard';

  const sidebarContent = (onLinkClick?: () => void) => (
    <div className="flex flex-col h-full">
      <div className="p-6 md:p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg tracking-tight">Yoseph Admin</h2>
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Control Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)}
            onClick={onLinkClick}
          />
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-neutral-100">
        <div className="flex items-center gap-3 px-4 py-4 mb-2">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-600 text-xs uppercase">
            {user?.email[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.email}</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">Administrator</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-3"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 bg-white border-r border-neutral-200 shrink-0">
        {sidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[60] md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 bottom-0 w-56 sm:w-64 bg-white z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-end px-4 pt-4 shrink-0 md:hidden">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 text-neutral-500 hover:text-black transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarContent(() => setIsMobileSidebarOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 md:h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-bold">
              {activeLabel}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-amber-500 transition-colors">
              View Website
            </a>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};