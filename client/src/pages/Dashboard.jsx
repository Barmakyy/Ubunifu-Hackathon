import { useState, useEffect } from 'react';
import { attendanceAPI, taskAPI, streakAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { Calendar, CheckCircle, XCircle, Clock, Flame, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function Dashboard() {
  const { user } = useAuthStore();
  const [todayClasses, setTodayClasses] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [streak, setStreak] = useState(null);
  const [stats, setStats] = useState({ attended: 0, missed: 0, attendanceRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [classesRes, tasksRes, streakRes, statsRes] = await Promise.all([
        attendanceAPI.getToday(),
        taskAPI.getToday(),
        streakAPI.get(),
        attendanceAPI.getStats({ period: 'week' })
      ]);

      setTodayClasses(classesRes.data);
      setTodayTasks(tasksRes.data);
      setStreak(streakRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (classItem, status) => {
    try {
      const { data } = await attendanceAPI.mark({
        timetableEntryId: classItem._id,
        date: new Date().toISOString(),
        status
      });

      toast.success(data.motivationalNote || 'Attendance marked!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const toggleTask = async (task) => {
    try {
      await taskAPI.update(task._id, { completed: !task.completed });
      toast.success(task.completed ? 'Task reopened' : 'Task completed! 🎉');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(' ')[0] || 'there';
    
    if (hour < 12) return `Good morning, ${name}! ☀️`;
    if (hour < 18) return `Good afternoon, ${name}! 🌤️`;
    return `Good evening, ${name}! 🌙`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}</h1>
        <p className="text-primary-100">Let's make today productive!</p>
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Attendance Streak</h3>
            <Flame className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{streak?.attendanceStreak?.current || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            Best: {streak?.attendanceStreak?.longest || 0} days
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Task Streak</h3>
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{streak?.taskStreak?.current || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            Best: {streak?.taskStreak?.longest || 0} days
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Total Points</h3>
            <Trophy className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{streak?.totalPoints || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.attendanceRate}% attendance rate
          </p>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Today's Classes</h2>
        </div>

        {todayClasses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No classes scheduled for today 🎉</p>
        ) : (
          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <div
                key={cls._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg
                  hover:border-primary-300 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cls.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {cls.startTime} - {cls.endTime}
                    {cls.location && ` • ${cls.location}`}
                  </p>
                  {cls.motivationalNote && (
                    <p className="text-sm text-primary-600 mt-2">{cls.motivationalNote}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {cls.attendanceStatus === 'pending' ? (
                    <>
                      <button
                        onClick={() => markAttendance(cls, 'attended')}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100
                          transition-colors"
                        title="Mark as attended"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => markAttendance(cls, 'missed')}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100
                          transition-colors"
                        title="Mark as missed"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  ) : cls.attendanceStatus === 'attended' ? (
                    <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      Attended
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                      Missed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
        </div>

        {todayTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks for today</p>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg
                  hover:border-primary-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 
                    focus:ring-primary-500 cursor-pointer"
                />
                <div className="flex-1">
                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-50 text-red-700' :
                  task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
