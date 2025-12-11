import { Outlet, NavLink } from 'react-router-dom';
import { 
  Calendar, BookOpen, BarChart3, User, LogOut,
  Menu, X, QrCode, Bell, HelpCircle, Users, Award, LayoutDashboard, TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

function EnhancedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const studentNav = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'My Classes', to: '/classes', icon: BookOpen },
    { name: 'Attendance History', to: '/attendance', icon: BarChart3 },
    { name: 'QR Check-in', to: '/scan', icon: QrCode },
    { name: 'Notifications', to: '/notifications', icon: Bell }
  ];

  const teacherNav = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'My Classes', to: '/classes', icon: BookOpen },
    { name: 'Timetable', to: '/timetable', icon: Calendar },
    { name: 'Analytics & Reports', to: '/analytics', icon: TrendingUp }
  ];

  const adminNav = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Students', to: '/students', icon: Users },
    { name: 'Lecturers', to: '/lecturers', icon: BookOpen },
    { name: 'Rewards', to: '/rewards-admin', icon: Award }
  ];

  const navigation = user?.role === 'student' ? studentNav :
                     user?.role === 'teacher' ? teacherNav :
                     user?.role === 'admin' ? adminNav : studentNav;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-violet-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-lg z-50 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between rounded-b-xl sm:rounded-b-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-sage-600">MySajili</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-sage-50 transition-colors active:bg-sage-100"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={22} className="sm:w-6 sm:h-6" /> : <Menu size={22} className="sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Sidebar - Slim & Collapsible */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white shadow-md w-64 z-40
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        rounded-r-2xl
      `}>
        {/* Header */}
        <div className="py-6 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 mb-1">MySajili</h1>
          <p className="text-xs text-gray-500">Hello, {user?.firstName}!</p>
        </div>

        {/* Navigation - Clean & Minimal */}
        <nav className="px-4 py-6 space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout - Always at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200 bg-white rounded-br-2xl">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default EnhancedLayout;
