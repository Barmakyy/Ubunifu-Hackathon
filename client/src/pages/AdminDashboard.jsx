import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar, 
  Activity,
  Building,
  GraduationCap,
  BarChart3,
  PieChart as PieChartIcon,
  School,
  MapPin,
  Download,
  RefreshCw,
  Eye,
  UserCheck,
  Zap
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  
  // Stats
  const [liveStats, setLiveStats] = useState({
    currentlyInClass: 0,
    totalStudents: 0,
    totalLecturers: 0,
    avgAttendanceToday: 0,
    activeClasses: 0
  });

  const [departmentStats, setDepartmentStats] = useState([]);
  const [programStats, setProgramStats] = useState([]);
  const [yearStats, setYearStats] = useState([]);
  const [genderStats, setGenderStats] = useState([]);
  const [roomUtilization, setRoomUtilization] = useState([]);
  const [lecturerPerformance, setLecturerPerformance] = useState([]);
  const [coursePopularity, setCoursePopularity] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    fetchAllData();
    
    const interval = setInterval(() => {
      fetchLiveData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLiveData(),
        fetchDepartmentStats(),
        fetchProgramStats(),
        fetchYearStats(),
        fetchGenderStats(),
        fetchRoomUtilization(),
        fetchLecturerPerformance(),
        fetchCoursePopularity(),
        fetchTrendData(),
        fetchLiveEvents()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      const [attendanceRes, usersRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/users')
      ]);

      const today = format(new Date('2025-12-11'), 'yyyy-MM-dd');
      const todayAttendance = attendanceRes.data.filter(a => a.date === today);
      
      const currentlyInClass = todayAttendance.filter(a => a.status === 'present').length;
      const students = usersRes.data.filter(u => u.role === 'student');
      const lecturers = usersRes.data.filter(u => u.role === 'teacher');
      
      const avgAttendance = todayAttendance.length > 0 
        ? Math.round((todayAttendance.filter(a => a.status === 'present').length / todayAttendance.length) * 100)
        : 0;

      const activeClasses = 5;

      setLiveStats({
        currentlyInClass,
        totalStudents: students.length,
        totalLecturers: lecturers.length,
        avgAttendanceToday: avgAttendance,
        activeClasses
      });
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      const [attendanceRes, unitsRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/units')
      ]);

      const deptMap = {};
      
      unitsRes.data.forEach(unit => {
        const dept = unit.department || 'General';
        if (!deptMap[dept]) {
          deptMap[dept] = { name: dept, attendance: 0, total: 0 };
        }
      });

      attendanceRes.data.forEach(record => {
        const unit = unitsRes.data.find(u => u.id === record.unitId);
        const dept = unit?.department || 'General';
        
        if (deptMap[dept]) {
          deptMap[dept].total += 1;
          if (record.status === 'present') {
            deptMap[dept].attendance += 1;
          }
        }
      });

      const deptStats = Object.values(deptMap).map(dept => ({
        ...dept,
        percentage: dept.total > 0 ? Math.round((dept.attendance / dept.total) * 100) : 0
      }));

      setDepartmentStats(deptStats);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    }
  };

  const fetchProgramStats = async () => {
    try {
      const [usersRes, attendanceRes] = await Promise.all([
        api.get('/users'),
        api.get('/attendance')
      ]);

      const students = usersRes.data.filter(u => u.role === 'student');
      const programMap = {};

      students.forEach(student => {
        const program = student.program || 'General';
        if (!programMap[program]) {
          programMap[program] = { name: program, students: 0, attendance: 0, total: 0 };
        }
        programMap[program].students += 1;
      });

      attendanceRes.data.forEach(record => {
        const student = students.find(s => s.id === record.studentId);
        const program = student?.program || 'General';
        
        if (programMap[program]) {
          programMap[program].total += 1;
          if (record.status === 'present') {
            programMap[program].attendance += 1;
          }
        }
      });

      const progStats = Object.values(programMap).map(prog => ({
        ...prog,
        percentage: prog.total > 0 ? Math.round((prog.attendance / prog.total) * 100) : 0
      }));

      setProgramStats(progStats);
    } catch (error) {
      console.error('Error fetching program stats:', error);
    }
  };

  const fetchYearStats = async () => {
    try {
      const [usersRes, attendanceRes] = await Promise.all([
        api.get('/users'),
        api.get('/attendance')
      ]);

      const students = usersRes.data.filter(u => u.role === 'student');
      const yearMap = { 
        1: { name: 'Year 1', total: 0, present: 0 }, 
        2: { name: 'Year 2', total: 0, present: 0 },
        3: { name: 'Year 3', total: 0, present: 0 },
        4: { name: 'Year 4', total: 0, present: 0 } 
      };

      attendanceRes.data.forEach(record => {
        const student = students.find(s => s.id === record.studentId);
        const year = student?.year || 1;
        
        if (yearMap[year]) {
          yearMap[year].total += 1;
          if (record.status === 'present') {
            yearMap[year].present += 1;
          }
        }
      });

      const yearStatsData = Object.values(yearMap).map(year => ({
        ...year,
        percentage: year.total > 0 ? Math.round((year.present / year.total) * 100) : 0
      }));

      setYearStats(yearStatsData);
    } catch (error) {
      console.error('Error fetching year stats:', error);
    }
  };

  const fetchGenderStats = async () => {
    try {
      const [usersRes, attendanceRes] = await Promise.all([
        api.get('/users'),
        api.get('/attendance')
      ]);

      const students = usersRes.data.filter(u => u.role === 'student');
      const genderMap = { Male: { total: 0, present: 0 }, Female: { total: 0, present: 0 } };

      attendanceRes.data.forEach(record => {
        const student = students.find(s => s.id === record.studentId);
        const gender = student?.gender || 'Male';
        
        if (genderMap[gender]) {
          genderMap[gender].total += 1;
          if (record.status === 'present') {
            genderMap[gender].present += 1;
          }
        }
      });

      const genderStatsData = Object.entries(genderMap).map(([gender, data]) => ({
        name: gender,
        value: data.total,
        percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
      }));

      setGenderStats(genderStatsData);
    } catch (error) {
      console.error('Error fetching gender stats:', error);
    }
  };

  const fetchRoomUtilization = async () => {
    try {
      const [timetableRes, attendanceRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/attendance')
      ]);

      const roomMap = {};

      timetableRes.data.forEach(slot => {
        const room = `Room ${slot.period}`;
        if (!roomMap[room]) {
          roomMap[room] = { name: room, sessions: 0, attendance: 0, total: 0 };
        }
        roomMap[room].sessions += 1;
      });

      attendanceRes.data.forEach(record => {
        const slot = timetableRes.data.find(t => t.unitId === record.unitId);
        if (slot) {
          const room = `Room ${slot.period}`;
          if (roomMap[room]) {
            roomMap[room].total += 1;
            if (record.status === 'present') {
              roomMap[room].attendance += 1;
            }
          }
        }
      });

      const roomStats = Object.values(roomMap).map(room => ({
        ...room,
        utilization: room.total > 0 ? Math.round((room.attendance / room.total) * 100) : 0
      }));

      setRoomUtilization(roomStats.slice(0, 10));
    } catch (error) {
      console.error('Error fetching room utilization:', error);
    }
  };

  const fetchLecturerPerformance = async () => {
    try {
      const [usersRes, attendanceRes, unitsRes] = await Promise.all([
        api.get('/users'),
        api.get('/attendance'),
        api.get('/units')
      ]);

      const lecturers = usersRes.data.filter(u => u.role === 'teacher');
      const lecturerMap = {};

      lecturers.forEach(lecturer => {
        lecturerMap[lecturer.id] = {
          name: `${lecturer.firstName} ${lecturer.lastName}`,
          total: 0,
          present: 0,
          classes: 0
        };
      });

      unitsRes.data.forEach(unit => {
        if (lecturerMap[unit.teacherId]) {
          lecturerMap[unit.teacherId].classes += 1;
        }
      });

      attendanceRes.data.forEach(record => {
        const unit = unitsRes.data.find(u => u.id === record.unitId);
        if (unit && lecturerMap[unit.teacherId]) {
          lecturerMap[unit.teacherId].total += 1;
          if (record.status === 'present') {
            lecturerMap[unit.teacherId].present += 1;
          }
        }
      });

      const lecturerStats = Object.values(lecturerMap)
        .map(lec => ({
          ...lec,
          percentage: lec.total > 0 ? Math.round((lec.present / lec.total) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage);

      setLecturerPerformance(lecturerStats);
    } catch (error) {
      console.error('Error fetching lecturer performance:', error);
    }
  };

  const fetchCoursePopularity = async () => {
    try {
      const [unitsRes, attendanceRes] = await Promise.all([
        api.get('/units'),
        api.get('/attendance')
      ]);

      const courseMap = {};

      unitsRes.data.forEach(unit => {
        courseMap[unit.id] = {
          name: unit.name,
          code: unit.code,
          total: 0,
          present: 0,
          enrolled: unit.enrolledStudents?.length || 0
        };
      });

      attendanceRes.data.forEach(record => {
        if (courseMap[record.unitId]) {
          courseMap[record.unitId].total += 1;
          if (record.status === 'present') {
            courseMap[record.unitId].present += 1;
          }
        }
      });

      const courseStats = Object.values(courseMap)
        .map(course => ({
          ...course,
          percentage: course.total > 0 ? Math.round((course.present / course.total) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage);

      setCoursePopularity(courseStats);
    } catch (error) {
      console.error('Error fetching course popularity:', error);
    }
  };

  const fetchTrendData = async () => {
    try {
      const attendanceRes = await api.get('/attendance');
      
      const dateMap = {};
      attendanceRes.data.forEach(record => {
        const date = record.date;
        if (!dateMap[date]) {
          dateMap[date] = { date, total: 0, present: 0 };
        }
        dateMap[date].total += 1;
        if (record.status === 'present') {
          dateMap[date].present += 1;
        }
      });

      const trends = Object.values(dateMap)
        .map(day => ({
          ...day,
          percentage: day.total > 0 ? Math.round((day.present / day.total) * 100) : 0
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setTrendData(trends.slice(-30));
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  const fetchLiveEvents = async () => {
    try {
      const [attendanceRes, usersRes, unitsRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/users'),
        api.get('/units')
      ]);

      const today = format(new Date('2025-12-11'), 'yyyy-MM-dd');
      const todayAttendance = attendanceRes.data
        .filter(a => a.date === today)
        .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
        .slice(0, 20);

      const events = todayAttendance.map(record => {
        const student = usersRes.data.find(u => u.id === record.studentId);
        const unit = unitsRes.data.find(u => u.id === record.unitId);
        
        return {
          id: record.id,
          studentName: student?.name || 'Unknown',
          unitName: unit?.name || 'Unknown',
          status: record.status,
          time: record.timestamp || record.date
        };
      });

      setLiveEvents(events);
    } catch (error) {
      console.error('Error fetching live events:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const exportData = () => {
    let csv = 'Metric,Value\n';
    csv += `Total Students,${liveStats.totalStudents}\n`;
    csv += `Total Lecturers,${liveStats.totalLecturers}\n`;
    csv += `Currently In Class,${liveStats.currentlyInClass}\n`;
    csv += `Average Attendance Today,${liveStats.avgAttendanceToday}%\n`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Real-time institution-wide analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={`sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={exportData}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export Data</span>
          </button>
        </div>
      </div>

      {/* Live Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Zap size={20} className="sm:w-6 sm:h-6" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide opacity-90">Live Now</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">{liveStats.currentlyInClass}</div>
          <div className="text-xs sm:text-sm opacity-90">Students in class</div>
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] sm:text-xs">Updated live</span>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Users size={20} className="sm:w-6 sm:h-6 text-purple-600" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500">Students</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{liveStats.totalStudents}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total enrolled</div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <BookOpen size={20} className="sm:w-6 sm:h-6 text-indigo-600" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500">Lecturers</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{liveStats.totalLecturers}</div>
          <div className="text-xs sm:text-sm text-gray-600">Teaching staff</div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Activity size={20} className="sm:w-6 sm:h-6 text-green-600" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500">Today</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{liveStats.avgAttendanceToday}%</div>
          <div className="text-xs sm:text-sm text-gray-600">Average attendance</div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Calendar size={20} className="sm:w-6 sm:h-6 text-orange-600" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500">Active</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{liveStats.activeClasses}</div>
          <div className="text-xs sm:text-sm text-gray-600">Classes ongoing</div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            <Eye className="inline mr-1 sm:mr-2" size={14} />
            Overview
          </button>
          <button
            onClick={() => setSelectedView('departments')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedView === 'departments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            <School className="inline mr-1 sm:mr-2" size={14} />
            Departments
          </button>
          <button
            onClick={() => setSelectedView('programs')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedView === 'programs'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            <GraduationCap className="inline mr-1 sm:mr-2" size={14} />
            Programs
          </button>
          <button
            onClick={() => setSelectedView('lecturers')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedView === 'lecturers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            <UserCheck className="inline mr-1 sm:mr-2" size={14} />
            Lecturers
          </button>
        </div>
      </div>

      {/* Main Content based on selected view */}
      {selectedView === 'overview' && (
        <>
          {/* Attendance Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-sm sm:text-base">Attendance Trend (Last 30 Days)</span>
            </h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    try {
                      return format(new Date(date), 'MMM dd');
                    } catch {
                      return date;
                    }
                  }}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      let formattedDate = data.date;
                      try {
                        formattedDate = format(new Date(data.date), 'MMMM dd, yyyy');
                      } catch {
                        // Use original date if formatting fails
                      }
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">
                            {formattedDate}
                          </p>
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            {data.percentage}% attendance
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {data.present} / {data.total} present
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No attendance data available for the selected period
              </div>
            )}
          </div>

          {/* Year and Gender Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Year of Study */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="sm:w-5 sm:h-5 text-purple-600" />
                <span className="text-sm sm:text-base">Year of Study Breakdown</span>
              </h3>
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <BarChart data={yearStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gender Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <PieChartIcon size={18} className="sm:w-5 sm:h-5 text-pink-600" />
                <span className="text-sm sm:text-base">Gender-Based Analytics</span>
              </h3>
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <PieChart>
                  <Pie
                    data={genderStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Utilization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Building size={18} className="sm:w-5 sm:h-5 text-indigo-600" />
              <span className="text-sm sm:text-base">Room Utilization</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              {roomUtilization.map((room, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <MapPin size={14} className="sm:w-4 sm:h-4 text-gray-600" />
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">{room.utilization}%</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700">{room.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{room.sessions} sessions</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Events Feed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
              <Activity size={18} className="sm:w-5 sm:h-5 text-green-600" />
              <span className="text-sm sm:text-base">Live Attendance Feed</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] sm:text-xs text-gray-500">Real-time</span>
              </span>
            </h3>
            <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {liveEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 flex-shrink-0 rounded-full ${
                      event.status === 'present' ? 'bg-green-500' :
                      event.status === 'late' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{event.studentName}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 truncate">{event.unitName}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                      event.status === 'present' ? 'bg-green-100 text-green-800' :
                      event.status === 'late' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedView === 'departments' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Department Analytics</h3>
          <div className="space-y-3 sm:space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">{dept.name}</h4>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">{dept.percentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all"
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 mt-2">
                  {dept.attendance} present / {dept.total} total records
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === 'programs' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Program-Level Analytics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {programStats.map((program, index) => (
              <div key={index} className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">{program.name}</h4>
                  <span className="text-2xl sm:text-3xl font-bold text-purple-600">{program.percentage}%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium text-gray-900">{program.students}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-medium text-gray-900">{program.attendance} / {program.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === 'lecturers' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Lecturer Performance Dashboard</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Lecturer</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Classes</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Attendance</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lecturerPerformance.map((lecturer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{lecturer.name}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-900">{lecturer.classes}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-600">
                      {lecturer.present} / {lecturer.total}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        lecturer.percentage >= 90 ? 'bg-green-100 text-green-800' :
                        lecturer.percentage >= 75 ? 'bg-blue-100 text-blue-800' :
                        lecturer.percentage >= 60 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lecturer.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Popularity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Award size={18} className="sm:w-5 sm:h-5 text-yellow-600" />
          <span className="text-sm sm:text-base">Course Popularity (Top 10)</span>
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {coursePopularity.slice(0, 10).map((course, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-4">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-blue-600">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{course.name}</p>
                  <span className="text-xs sm:text-sm font-semibold text-blue-600 flex-shrink-0">{course.percentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div 
                    className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all"
                    style={{ width: `${course.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0 hidden sm:block">{course.enrolled} enrolled</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
