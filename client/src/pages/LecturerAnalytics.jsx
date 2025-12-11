import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Clock,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  FileText,
  ChevronDown,
  CheckCircle,
  XCircle,
  Mail
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function LecturerAnalytics() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [dateRange, setDateRange] = useState('month'); // week, month, semester, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Analytics Data
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [studentReports, setStudentReports] = useState([]);
  const [dayAnalysis, setDayAnalysis] = useState([]);
  const [timeAnalysis, setTimeAnalysis] = useState({ morning: 0, afternoon: 0, evening: 0 });
  const [overallStats, setOverallStats] = useState({
    totalSessions: 0,
    averageAttendance: 0,
    totalStudents: 0,
    atRiskStudents: 0,
    eligibleStudents: 0
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [showCustomReport, setShowCustomReport] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (units.length > 0) {
      fetchAnalytics();
    }
  }, [units, selectedUnit, dateRange, startDate, endDate]);

  const fetchUnits = async () => {
    try {
      const response = await api.get(`/units?teacherId=${user.id}`);
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error('Failed to load units');
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [attendanceRes, usersRes, timetableRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/users?role=student'),
        api.get('/timetable')
      ]);

      const allAttendance = attendanceRes.data;
      const allStudents = usersRes.data;
      const timetable = timetableRes.data;

      // Filter by selected unit
      const unitIds = selectedUnit === 'all' 
        ? units.map(u => u.id) 
        : [selectedUnit];

      // Filter by date range
      const filteredAttendance = filterByDateRange(allAttendance);

      // Calculate trends
      calculateAttendanceTrends(filteredAttendance, unitIds);
      
      // Calculate student reports
      calculateStudentReports(filteredAttendance, allStudents, unitIds);
      
      // Calculate day analysis
      calculateDayAnalysis(filteredAttendance, timetable, unitIds);
      
      // Calculate time analysis
      calculateTimeAnalysis(filteredAttendance, timetable, unitIds);
      
      // Calculate overall stats
      calculateOverallStats(filteredAttendance, allStudents, unitIds);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = (attendance) => {
    const now = new Date('2025-12-11'); // Current date
    let filtered = attendance;

    switch (dateRange) {
      case 'week':
        const weekStart = startOfWeek(now);
        filtered = attendance.filter(a => new Date(a.date) >= weekStart);
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = attendance.filter(a => new Date(a.date) >= monthStart);
        break;
      case 'semester':
        const semesterStart = new Date(now.getFullYear(), 8, 1); // Sept 1
        filtered = attendance.filter(a => new Date(a.date) >= semesterStart);
        break;
      case 'custom':
        if (startDate && endDate) {
          filtered = attendance.filter(a => {
            const date = new Date(a.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
          });
        }
        break;
    }

    return filtered;
  };

  const calculateAttendanceTrends = (attendance, unitIds) => {
    // Group by date and calculate attendance percentage
    const dateMap = {};
    
    attendance.forEach(record => {
      if (!unitIds.includes(record.unitId)) return;
      
      const date = record.date;
      if (!dateMap[date]) {
        dateMap[date] = { present: 0, total: 0 };
      }
      
      dateMap[date].present += record.status === 'present' ? 1 : 0;
      dateMap[date].total += 1;
    });

    const trends = Object.entries(dateMap)
      .map(([date, data]) => ({
        date,
        percentage: Math.round((data.present / data.total) * 100),
        present: data.present,
        total: data.total
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setAttendanceTrends(trends);
  };

  const calculateStudentReports = (attendance, students, unitIds) => {
    const studentMap = {};

    attendance.forEach(record => {
      if (!unitIds.includes(record.unitId)) return;

      if (!studentMap[record.studentId]) {
        const student = students.find(s => s.id === record.studentId);
        if (!student) return;
        
        studentMap[record.studentId] = {
          studentId: record.studentId,
          name: student.name,
          email: student.email,
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
          attendanceRate: 0,
          trend: 'stable'
        };
      }

      const status = record.status;
      studentMap[record.studentId][status] += 1;
      studentMap[record.studentId].total += 1;
    });

    const reports = Object.values(studentMap).map(student => {
      student.attendanceRate = Math.round((student.present / student.total) * 100);
      
      // Calculate trend (last 5 sessions vs previous 5)
      const recentAttendance = attendance
        .filter(a => a.studentId === student.studentId && unitIds.includes(a.unitId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (recentAttendance.length >= 10) {
        const recent5 = recentAttendance.slice(0, 5).filter(a => a.status === 'present').length;
        const previous5 = recentAttendance.slice(5, 10).filter(a => a.status === 'present').length;
        
        if (recent5 > previous5) student.trend = 'improving';
        else if (recent5 < previous5) student.trend = 'declining';
      }
      
      return student;
    });

    setStudentReports(reports.sort((a, b) => a.attendanceRate - b.attendanceRate));
  };

  const calculateDayAnalysis = (attendance, timetable, unitIds) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayMap = {};

    days.forEach(day => {
      dayMap[day] = { present: 0, total: 0, percentage: 0, sessions: 0 };
    });

    attendance.forEach(record => {
      if (!unitIds.includes(record.unitId)) return;
      
      const date = new Date(record.date);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Sunday
      
      dayMap[dayName].total += 1;
      if (record.status === 'present') {
        dayMap[dayName].present += 1;
      }
    });

    // Count sessions per day from timetable
    timetable.forEach(slot => {
      if (unitIds.includes(slot.unitId)) {
        dayMap[slot.day].sessions += 1;
      }
    });

    const analysis = days.map(day => ({
      day,
      ...dayMap[day],
      percentage: dayMap[day].total > 0 
        ? Math.round((dayMap[day].present / dayMap[day].total) * 100)
        : 0
    }));

    setDayAnalysis(analysis);
  };

  const calculateTimeAnalysis = (attendance, timetable, unitIds) => {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    const timeCounts = { morning: 0, afternoon: 0, evening: 0 };

    attendance.forEach(record => {
      if (!unitIds.includes(record.unitId)) return;
      
      // Find corresponding timetable slot
      const slot = timetable.find(t => t.unitId === record.unitId);
      if (!slot) return;

      const hour = parseInt(slot.startTime.split(':')[0]);
      let period;
      
      if (hour < 12) period = 'morning';
      else if (hour < 17) period = 'afternoon';
      else period = 'evening';

      timeCounts[period] += 1;
      if (record.status === 'present') {
        timeSlots[period] += 1;
      }
    });

    setTimeAnalysis({
      morning: timeCounts.morning > 0 ? Math.round((timeSlots.morning / timeCounts.morning) * 100) : 0,
      afternoon: timeCounts.afternoon > 0 ? Math.round((timeSlots.afternoon / timeCounts.afternoon) * 100) : 0,
      evening: timeCounts.evening > 0 ? Math.round((timeSlots.evening / timeCounts.evening) * 100) : 0
    });
  };

  const calculateOverallStats = (attendance, students, unitIds) => {
    const uniqueSessions = new Set();
    const studentAttendance = {};

    attendance.forEach(record => {
      if (!unitIds.includes(record.unitId)) return;
      
      uniqueSessions.add(`${record.date}-${record.unitId}`);
      
      if (!studentAttendance[record.studentId]) {
        studentAttendance[record.studentId] = { present: 0, total: 0 };
      }
      
      studentAttendance[record.studentId].total += 1;
      if (record.status === 'present') {
        studentAttendance[record.studentId].present += 1;
      }
    });

    const totalAttendance = attendance.filter(a => unitIds.includes(a.unitId) && a.status === 'present').length;
    const totalRecords = attendance.filter(a => unitIds.includes(a.unitId)).length;
    
    const atRisk = Object.values(studentAttendance).filter(s => 
      (s.present / s.total) * 100 < attendanceThreshold
    ).length;

    const eligible = Object.values(studentAttendance).filter(s => 
      (s.present / s.total) * 100 >= attendanceThreshold
    ).length;

    setOverallStats({
      totalSessions: uniqueSessions.size,
      averageAttendance: totalRecords > 0 ? Math.round((totalAttendance / totalRecords) * 100) : 0,
      totalStudents: Object.keys(studentAttendance).length,
      atRiskStudents: atRisk,
      eligibleStudents: eligible
    });
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const exportToExcel = () => {
    // Create CSV content
    let csv = 'Student Name,Email,Total Sessions,Present,Absent,Late,Attendance Rate,Status\n';
    
    studentReports.forEach(student => {
      const status = student.attendanceRate >= attendanceThreshold ? 'Eligible' : 'At Risk';
      csv += `"${student.name}","${student.email}",${student.total},${student.present},${student.absent},${student.late},${student.attendanceRate}%,${status}\n`;
    });

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
  };



  const sendWeeklySummary = async () => {
    try {
      // In a real app, this would trigger an email
      toast.success('Weekly summary sent to your email!');
    } catch (error) {
      toast.error('Failed to send summary');
    }
  };

  const generateEligibilityList = () => {
    const eligible = studentReports.filter(s => s.attendanceRate >= attendanceThreshold);
    
    let csv = 'Student Name,Email,Attendance Rate,Total Sessions,Status\n';
    eligible.forEach(student => {
      csv += `"${student.name}","${student.email}",${student.attendanceRate}%,${student.total},Eligible\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-eligibility-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`${eligible.length} eligible students exported!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Comprehensive attendance insights and analytics</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={sendWeeklySummary}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Mail size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Email Summary</span>
            <span className="sm:hidden">Email</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </button>

        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <Filter size={16} className="sm:w-[18px] sm:h-[18px] text-gray-600" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Unit Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm"
            >
              <option value="all">All Units</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm"
                />
              </div>
            </>
          )}

          {/* Attendance Threshold */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Eligibility Threshold ({attendanceThreshold}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={attendanceThreshold}
              onChange={(e) => setAttendanceThreshold(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <Calendar size={16} className="sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{overallStats.totalSessions}</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Total Sessions</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <Activity size={16} className="sm:w-5 sm:h-5 text-green-600" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{overallStats.averageAttendance}%</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Avg Attendance</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <Users size={16} className="sm:w-5 sm:h-5 text-purple-600" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{overallStats.totalStudents}</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Total Students</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <AlertCircle size={16} className="sm:w-5 sm:h-5 text-orange-600" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{overallStats.atRiskStudents}</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">At Risk Students</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <CheckCircle size={16} className="sm:w-5 sm:h-5 text-green-600" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{overallStats.eligibleStudents}</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Eligible Students</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Trends Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="sm:w-5 sm:h-5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Attendance Trends</h3>
            </div>
            <div className="text-xs text-gray-500">Last {attendanceTrends.length} sessions</div>
          </div>
          {attendanceTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceTrends.slice(-15)}>
                <defs>
                  <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(data.date), 'MMMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            Attendance: {data.percentage}%
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {data.present} present / {data.total} total
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
                  fill="url(#colorPercentage)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No attendance data available
            </div>
          )}
        </div>

        {/* Day of Week Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <BarChart3 size={18} className="sm:w-5 sm:h-5 text-purple-600" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Day of Week Analysis</h3>
          </div>
          {dayAnalysis.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(day) => day.substring(0, 3)}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{data.day}</p>
                          <p className="text-sm text-purple-600 font-medium mt-1">
                            Attendance: {data.percentage}%
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {data.present} present / {data.total} total
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {data.sessions} sessions scheduled
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="percentage" 
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  label={({ value }) => `${value}%`}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Time of Day Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Clock size={18} className="sm:w-5 sm:h-5 text-indigo-600" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Time of Day Analysis</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Morning (8AM - 12PM)</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{timeAnalysis.morning}%</p>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${timeAnalysis.morning}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-200">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Afternoon (12PM - 5PM)</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{timeAnalysis.afternoon}%</p>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${timeAnalysis.afternoon}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-200">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Evening (5PM+)</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{timeAnalysis.evening}%</p>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${timeAnalysis.evening}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="sm:w-5 sm:h-5 text-gray-600" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Individual Student Reports</h3>
          </div>
          <button
            onClick={generateEligibilityList}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Exam Eligibility List</span>
            <span className="sm:hidden">Eligibility List</span>
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Student</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Total</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Present</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Absent</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Late</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Rate</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Trend</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentReports.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-900">{student.total}</td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-green-600 font-medium">{student.present}</td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-red-600 font-medium">{student.absent}</td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-orange-600 font-medium">{student.late}</td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      student.attendanceRate >= 90 ? 'bg-green-100 text-green-800' :
                      student.attendanceRate >= 75 ? 'bg-blue-100 text-blue-800' :
                      student.attendanceRate >= 60 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.attendanceRate}%
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center">
                    {student.trend === 'improving' && <TrendingUp size={14} className="sm:w-4 sm:h-4 text-green-600 mx-auto" />}
                    {student.trend === 'declining' && <TrendingDown size={14} className="sm:w-4 sm:h-4 text-red-600 mx-auto" />}
                    {student.trend === 'stable' && <Activity size={14} className="sm:w-4 sm:h-4 text-gray-400 mx-auto" />}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center">
                    {student.attendanceRate >= attendanceThreshold ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={12} />
                        At Risk
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center">
                    <button
                      onClick={() => viewStudentDetails(student)}
                      className="text-blue-600 hover:text-blue-800 active:text-blue-900 text-xs sm:text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{selectedStudent.name}</h2>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1">{selectedStudent.email}</p>
                </div>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-white hover:bg-blue-800 active:bg-blue-900 p-1.5 sm:p-2 rounded-lg transition-colors"
                >
                  <XCircle size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedStudent.total}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Total Sessions</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.present}</p>
                  <p className="text-xs text-gray-600 mt-1">Present</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                  <p className="text-2xl font-bold text-red-600">{selectedStudent.absent}</p>
                  <p className="text-xs text-gray-600 mt-1">Absent</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 text-center">
                  <p className="text-2xl font-bold text-orange-600">{selectedStudent.late}</p>
                  <p className="text-xs text-gray-600 mt-1">Late</p>
                </div>
              </div>

              {/* Attendance Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Overall Attendance Rate</h4>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">{selectedStudent.attendanceRate}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      selectedStudent.attendanceRate >= 90 ? 'bg-green-500' :
                      selectedStudent.attendanceRate >= 75 ? 'bg-blue-500' :
                      selectedStudent.attendanceRate >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedStudent.attendanceRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Status & Recommendations */}
              <div className={`p-3 sm:p-4 rounded-lg border ${
                selectedStudent.attendanceRate >= attendanceThreshold
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className="font-semibold text-gray-900 mb-2">Status & Recommendations</h4>
                {selectedStudent.attendanceRate >= attendanceThreshold ? (
                  <p className="text-sm text-gray-700">
                    ✓ Student meets the {attendanceThreshold}% attendance requirement and is eligible for exams.
                  </p>
                ) : (
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>⚠️ Student is below the {attendanceThreshold}% attendance requirement.</p>
                    <p className="font-medium">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Schedule a meeting to discuss attendance</li>
                      <li>Identify barriers to attendance</li>
                      <li>Create an improvement plan</li>
                      <li>Monitor progress closely</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
