import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
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
  isActive 
}: { 
  to: string; 
  icon: any; 
  label: string; 
  isActive: boolean 
}) => (
  <Link
    to={to}
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAdminAuthStore(state => state.logout);
  const user = useAdminAuthStore(state => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
    { to: '/dashboard/products', icon: Package, label: 'Products' },
    { to: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const activeLabel = navItems.find(item => 
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-neutral-200 transition-transform duration-300 md:relative md:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center gap-3">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
          <button 
            className="md:hidden p-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold">
                {activeLabel}
             </h1>
          </div>

          <div className="flex items-center gap-4">
            <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-amber-500 transition-colors">
              View Website
            </a>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
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