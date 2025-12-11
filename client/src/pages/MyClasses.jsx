import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { 
  BookOpen, 
  Clock, 
  MapPin, 
  User, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';

export default function MyClasses() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, good, warning, danger

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id]);

  const fetchClasses = async () => {
    try {
      if (!user?.selectedUnits || user.selectedUnits.length === 0) {
        setClasses([]);
        return;
      }

      // Fetch units, teachers, timetable, and attendance records
      const [unitsRes, usersRes, timetableRes, attendanceRes] = await Promise.all([
        axios.get('http://localhost:8000/units'),
        axios.get('http://localhost:8000/users'),
        axios.get('http://localhost:8000/timetable'),
        axios.get(`http://localhost:8000/attendance?studentId=${user.id}`)
      ]);

      const allUnits = unitsRes.data;
      const teachers = usersRes.data.filter(u => u.role === 'teacher');
      const timetable = timetableRes.data;
      const attendanceRecords = attendanceRes.data;

      // Filter units that the student is enrolled in
      const enrolledUnits = allUnits.filter(unit => 
        user.selectedUnits.includes(unit.id)
      );

      // Get day mapping
      const getDaySchedule = (unitId, classId) => {
        const classSchedule = timetable.find(t => t.classId === classId);
        if (!classSchedule) return { days: 'N/A', time: 'N/A' };

        const periods = classSchedule.periods?.filter(p => p.unitId === unitId) || [];
        if (periods.length === 0) return { days: classSchedule.day || 'N/A', time: 'N/A' };

        const period = periods[0];
        const startTime = period.startTime ? new Date(`2000-01-01T${period.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A';
        const endTime = period.endTime ? new Date(`2000-01-01T${period.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A';

        return {
          days: classSchedule.day,
          time: `${startTime} - ${endTime}`
        };
      };

      // Calculate attendance for each unit
      const enrichedClasses = enrolledUnits.map(unit => {
        const teacher = teachers.find(t => t.id === unit.teacherId);
        const schedule = getDaySchedule(unit.id, unit.classId);
        
        // Count attendance for this specific unit
        const unitAttendance = attendanceRecords.filter(att => att.unitId === unit.id);
        const attendedSessions = unitAttendance.filter(att => att.status === 'present').length;
        
        // Estimate total sessions (assuming ~3 sessions per week over ~15 weeks semester)
        const estimatedTotalSessions = 15; // Adjust based on your actual semester structure
        const totalSessions = Math.max(unitAttendance.length, estimatedTotalSessions);

        return {
          id: unit.id,
          code: unit.id.toUpperCase(),
          name: unit.name,
          instructor: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
          schedule: schedule.days,
          time: schedule.time,
          room: `Room ${Math.floor(Math.random() * 300) + 100}`, // Generate room number
          totalSessions: totalSessions,
          attended: attendedSessions,
          department: user.department || 'Computer Science'
        };
      });

      setClasses(enrichedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const getAttendancePercentage = (attended, total) => {
    return Math.round((attended / total) * 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' };
    if (percentage >= 60) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const percentage = getAttendancePercentage(cls.attended, cls.totalSessions);
    if (filterStatus === 'good') return matchesSearch && percentage >= 80;
    if (filterStatus === 'warning') return matchesSearch && percentage >= 60 && percentage < 80;
    if (filterStatus === 'danger') return matchesSearch && percentage < 60;
    
    return matchesSearch;
  });

  // Use user's actual stats from database
  const totalSessions = user?.totalClasses || classes.reduce((sum, cls) => sum + cls.totalSessions, 0);
  const totalAttended = user?.attendedClasses || classes.reduce((sum, cls) => sum + cls.attended, 0);
  const overallPercentage = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Classes</h1>
          <p className="text-gray-600">Track your attendance across all enrolled courses</p>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attended</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttended}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Rate</p>
                <p className="text-2xl font-bold text-gray-900">{overallPercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by course name, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('good')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'good' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Good
              </button>
              <button
                onClick={() => setFilterStatus('warning')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'warning' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setFilterStatus('danger')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'danger' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Danger
              </button>
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="grid gap-6">
          {filteredClasses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No classes found matching your criteria</p>
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const percentage = getAttendancePercentage(cls.attended, cls.totalSessions);
              const colors = getStatusColor(percentage);
              
              return (
                <div
                  key={cls.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border ${colors.border} hover:shadow-md transition-shadow`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Class Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <BookOpen className={colors.text} size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                              {cls.code}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User size={16} />
                              <span>{cls.instructor}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>{cls.schedule}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>{cls.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              <span>{cls.room}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Stats */}
                    <div className="flex items-center gap-6">
                      {/* Progress Circle */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="32"
                              stroke="#e5e7eb"
                              strokeWidth="6"
                              fill="none"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="32"
                              stroke={percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444'}
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 32}`}
                              strokeDashoffset={`${2 * Math.PI * 32 * (1 - percentage / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-lg font-bold ${colors.text}`}>{percentage}%</span>
                          </div>
                        </div>
                        <span className={`text-xs font-medium mt-2 ${colors.badge} px-2 py-1 rounded`}>
                          {percentage >= 80 ? 'Good' : percentage >= 60 ? 'Warning' : 'Danger'}
                        </span>
                      </div>

                      {/* Sessions Info */}
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="text-green-600" size={20} />
                          <span className="text-sm text-gray-600">
                            <span className="font-bold text-gray-900">{cls.attended}</span> / {cls.totalSessions}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Sessions Attended</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
