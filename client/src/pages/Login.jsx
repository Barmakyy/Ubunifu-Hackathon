import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch users and admins from db.json
      const [usersResponse, adminsResponse] = await Promise.all([
        axios.get('http://localhost:8000/users'),
        axios.get('http://localhost:8000/admins')
      ]);

      const allUsers = [...usersResponse.data, ...adminsResponse.data];
      
      // Find user by email and password
      const user = allUsers.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (!user) {
        toast.error('Invalid email or password');
        setLoading(false);
        return;
      }

      // Set auth with actual user data
      setAuth(user, 'token-' + user.id);
      toast.success(`Welcome back, ${user.firstName}! 🌟`);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-8">
        
        {/* Icon and Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm">We're glad you're here. Let's continue your journey.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-green-600 hover:text-green-700 font-medium">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 p-3 bg-gray-100 rounded-md">
          <p className="text-xs text-gray-700 font-semibold mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div>
              <span className="font-medium">Student:</span> fatima.amin@student.coasttech.ac.ke / student123
            </div>
            <div>
              <span className="font-medium">Lecturer:</span> anne.ndungu@coasttech.ac.ke / lec456
            </div>
            <div>
              <span className="font-medium">Admin:</span> admin@coasttech.ac.ke / admin123
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
