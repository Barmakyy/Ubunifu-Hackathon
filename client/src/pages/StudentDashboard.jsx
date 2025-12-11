import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Flame, QrCode, Gift, MessageCircle, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      // Mock data - replace with actual API call
      const schedule = [
        { id: 1, unit: 'Programming 101', time: '08:00 - 09:00', room: 'Lab 1', attended: true },
        { id: 2, unit: 'Discrete Mathematics', time: '09:15 - 10:15', room: 'Room 203', attended: false },
        { id: 3, unit: 'Computer Systems', time: '10:30 - 11:30', room: 'Lab 2', attended: false }
      ];
      setTodaySchedule(schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.firstName || 'there';
    const tones = {
      encouraging: ['You have got this', 'Ready to shine', 'Make it great'],
      gentle: ['Take it one step at a time', 'You are doing well', 'Breathe and begin'],
      motivating: ['Time to crush it', 'Go for it', 'Make today count'],
      supportive: ['We are here for you', 'You are not alone', 'One day at a time'],
      calm: ['Peace and focus', 'Steady as you go', 'Find your center']
    };
    
    const tone = user?.motivationalTone || 'encouraging';
    const message = tones[tone][Math.floor(Math.random() * tones[tone].length)];
    
    if (hour < 12) return `Good morning, ${name}! ☀️ ${message}.`;
    if (hour < 18) return `Good afternoon, ${name}! 🌤️ ${message}.`;
    return `Good evening, ${name}! 🌙 ${message}.`;
  };

  const streakPercentage = ((user?.streak || 0) / 60) * 100;
  const attendanceRate = ((user?.attendedClasses || 0) / (user?.totalClasses || 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Simple Greeting Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{getGreeting()}</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your attendance and maintain your streak</p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Simple Streak Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Flame className="text-orange-500" size={18} />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Streak</h2>
              </div>
              
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-orange-50 border-4 border-orange-200 mb-3">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-orange-600">{user?.streak || 0}</div>
                    <div className="text-[10px] sm:text-xs text-orange-600 font-medium">Days</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-600">Classes Attended</span>
                  <span className="text-base sm:text-lg font-semibold text-gray-900">{user?.attendedClasses || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-600">Attendance Rate</span>
                  <span className="text-base sm:text-lg font-semibold text-gray-900">{Math.round(attendanceRate)}%</span>
                </div>
                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-600">Grace Units Left</span>
                  <span className="text-base sm:text-lg font-semibold text-gray-900">{user?.graceUnitsRemaining || 0}/{user?.graceUnitsTotal || 2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule - Clean */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600" size={18} />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Today's Classes</h2>
                </div>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>

              {todaySchedule.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm sm:text-base text-gray-600">No classes scheduled for today</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {todaySchedule.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={`p-3 sm:p-4 rounded-lg border ${
                        classItem.attended
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">{classItem.unit}</h3>
                            {classItem.attended && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-green-500 text-white text-[10px] sm:text-xs font-medium rounded flex items-center gap-1">
                                <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                                Attended
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                              {classItem.time}
                            </span>
                            <span>{classItem.room}</span>
                          </div>
                        </div>
                        
                        {!classItem.attended && (
                          <button
                            onClick={() => navigate('/scan')}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-1.5 sm:gap-2"
                          >
                            <QrCode size={14} className="sm:w-4 sm:h-4" />
                            Scan QR
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1">Total Classes</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{user?.totalClasses || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={18} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1">Attended</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{user?.attendedClasses || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={18} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{user?.streak || 0} days</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Flame className="text-orange-600" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <button
            onClick={() => navigate('/scan')}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-md active:shadow-sm transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <QrCode className="text-blue-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Scan QR</span>
          </button>

          <button
            onClick={() => navigate('/rewards')}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-md active:shadow-sm transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Gift className="text-green-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Rewards</span>
          </button>

          <button
            onClick={() => navigate('/chatbot')}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-md active:shadow-sm transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <MessageCircle className="text-purple-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Chat</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-md active:shadow-sm transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Reports</span>
          </button>
        </div>

        {/* Motivational Quote */}
        <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-blue-200">
          <p className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">
            "Your streak is your story, not your stress"
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            Remember: showing up is half the battle. You're doing great. 🌟
          </p>
        </div>
      </div>
    </div>
  );
}
