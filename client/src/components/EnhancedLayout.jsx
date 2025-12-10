import { Outlet, NavLink } from 'react-router-dom';
import { 
  Calendar, BookOpen, BarChart3, User, LogOut,
  Menu, X, QrCode, Bell, HelpCircle, Users, Award, LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

function EnhancedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const studentNav = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, emoji: '🏠' },
    { name: 'My Classes', to: '/classes', icon: BookOpen, emoji: '📚' },
    { name: 'Attendance History', to: '/attendance-history', icon: BarChart3, emoji: '📊' },
    { name: 'QR Check-in', to: '/scan', icon: QrCode, emoji: '📷' },
    { name: 'Notifications', to: '/notifications', icon: Bell, emoji: '🔔' }
  ];

  const teacherNav = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, emoji: '🏠' },
    { name: 'My Classes', to: '/classes', icon: BookOpen, emoji: '📚' }
  ];

  const adminNav = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, emoji: '🏠' },
    { name: 'Students', to: '/students', icon: Users, emoji: '👥' },
    { name: 'Lecturers', to: '/lecturers', icon: BookOpen, emoji: '👨‍🏫' },
    { name: 'Rewards', to: '/rewards-admin', icon: Award, emoji: '🏆' }
  ];

  const navigation = user?.role === 'student' ? studentNav :
                     user?.role === 'teacher' ? teacherNav :
                     user?.role === 'admin' ? adminNav : studentNav;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-violet-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-lg z-50 px-4 py-3 flex items-center justify-between rounded-b-2xl">
        <h1 className="text-xl font-bold text-sage-600">AttendWell</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-sage-50 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
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
          <h1 className="text-xl font-bold text-gray-800 mb-1">AttendWell</h1>
          <p className="text-xs text-gray-500">Hello, {user?.firstName}!</p>
        </div>

        {/* Navigation - Clean & Minimal */}
        <nav className="px-4 py-6 space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto">
          {navigation.map((item) => (
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
              <span className="text-lg">{item.emoji}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout - Always at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200 bg-white rounded-br-2xl">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default EnhancedLayout;
