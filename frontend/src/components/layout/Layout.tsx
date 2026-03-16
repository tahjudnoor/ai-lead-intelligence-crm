import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Brain, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 lg:relative",
          isSidebarOpen ? "w-64" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <Brain className="h-8 w-8 text-indigo-600 flex-shrink-0" />
            <span className={cn(
              "ml-3 font-bold text-xl tracking-tight transition-opacity duration-200",
              isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
            )}>
              AI CRM
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group",
                  location.pathname === item.path 
                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  location.pathname === item.path ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600"
                )} />
                <span className={cn(
                  "ml-3 font-medium transition-opacity duration-200",
                  isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
                )}>
                  {item.name}
                </span>
                {location.pathname === item.path && isSidebarOpen && (
                  <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center px-3 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 group-hover:text-red-600" />
              <span className={cn(
                "ml-3 font-medium transition-opacity duration-200",
                isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
              )}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:mr-4 transition-colors"
            >
              {isSidebarOpen ? <X className="h-6 w-6 lg:hidden" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-3 py-1.5 w-64 lg:w-96">
              <Search className="h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search leads, tasks, analytics..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center space-y-0 space-x-2 md:space-x-4">
            <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 leading-tight">Administrator</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 ring-2 ring-white ring-offset-2 ring-offset-indigo-50">
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
