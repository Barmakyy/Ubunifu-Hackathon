import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import Timetable from './pages/Timetable';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import EmotionalChatbot from './pages/EmotionalChatbot';
import Reports from './pages/Reports';
import QRScanner from './pages/QRScanner';
import Rewards from './pages/Rewards';
import LecturerDashboard from './pages/LecturerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Layout
import EnhancedLayout from './components/EnhancedLayout';

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            borderRadius: '0.75rem',
            background: '#fff',
            color: '#2e4b2e',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <EnhancedLayout />
          </ProtectedRoute>
        }>
          {/* Student Routes */}
          {user?.role === 'student' && (
            <>
              <Route index element={<StudentDashboard />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="goals" element={<Goals />} />
              <Route path="profile" element={<Profile />} />
              <Route path="chatbot" element={<EmotionalChatbot />} />
              <Route path="reports" element={<Reports />} />
              <Route path="scan" element={<QRScanner />} />
              <Route path="rewards" element={<Rewards />} />
            </>
          )}
          
          {/* Lecturer Routes */}
          {user?.role === 'teacher' && (
            <>
              <Route index element={<LecturerDashboard />} />
              <Route path="profile" element={<Profile />} />
            </>
          )}
          
          {/* Admin Routes */}
          {user?.role === 'admin' && (
            <>
              <Route index element={<AdminDashboard />} />
              <Route path="profile" element={<Profile />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
