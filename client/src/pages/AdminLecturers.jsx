import { useState, useEffect } from 'react';
import { 
  Users, Search, Download, TrendingUp, TrendingDown, 
  BookOpen, ChevronDown, ChevronUp, Award, AlertCircle,
  Calendar, Mail, Phone, CheckCircle, Clock, FileText
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminLecturers = () => {
  const [lecturers, setLecturers] = useState([]);
  const [filteredLecturers, setFilteredLecturers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [units, setUnits] = useState([]);
  const [students, setStudents] = useState([]);
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPerformance, setFilterPerformance] = useState('all'); // excellent, good, needs-support
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    averageAttendance: 0,
    topPerformers: 0,
    needsSupport: 0
  });
  
  // Expanded lecturer detail
  const [expandedLecturer, setExpandedLecturer] = useState(null);
  const [lecturerDetail, setLecturerDetail] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const lecturersPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDepartment, filterPerformance, lecturers]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, attendanceRes, unitsRes, rescheduleRes] = await Promise.all([
        api.get('/users'),
        api.get('/attendance'),
        api.get('/units'),
        api.get('/rescheduleRequests')
      ]);

      const lecturersData = usersRes.data.filter(u => u.role === 'teacher');
      const studentsData = usersRes.data.filter(u => u.role === 'student');
      
      // Calculate stats for each lecturer
      const lecturersWithStats = lecturersData.map(lecturer => {
        // Get units taught by this lecturer
        const lecturerUnits = unitsRes.data.filter(u => u.teacherId === lecturer.id);
        
        // Get attendance records for lecturer's units
        const lecturerAttendance = attendanceRes.data.filter(a => 
          lecturerUnits.some(u => u.id === a.unitId)
        );
        
        // Get unique students in lecturer's classes
        const uniqueStudents = new Set(lecturerAttendance.map(a => a.studentId));
        
        const totalClasses = lecturerAttendance.length;
        const presentClasses = lecturerAttendance.filter(a => a.status === 'present').length;
        const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
        
        // Get pending reschedule requests
        const pendingRequests = rescheduleRes.data.filter(
          r => r.teacherId === lecturer.id && r.status === 'pending'
        ).length;
        
        let performance = 'good';
        if (attendanceRate >= 85) performance = 'excellent';
        else if (attendanceRate < 70) performance = 'needs-support';
        
        // Get department from first unit (assuming all units in same department)
        const department = lecturerUnits[0]?.department || 'N/A';
        
        return {
          ...lecturer,
          coursesCount: lecturerUnits.length,
          studentsCount: uniqueStudents.size,
          totalClasses,
          presentClasses,
          attendanceRate,
          performance,
          department,
          pendingRequests,
          units: lecturerUnits
        };
      });

      setLecturers(lecturersWithStats);
      setAttendance(attendanceRes.data);
      setUnits(unitsRes.data);
      setStudents(studentsData);
      setRescheduleRequests(rescheduleRes.data);
      
      // Calculate overall stats
      const total = lecturersWithStats.length;
      const avgAttendance = total > 0 
        ? Math.round(lecturersWithStats.reduce((sum, l) => sum + l.attendanceRate, 0) / total) 
        : 0;
      const topPerformers = lecturersWithStats.filter(l => l.attendanceRate >= 85).length;
      const needsSupport = lecturersWithStats.filter(l => l.attendanceRate < 70).length;
      
      setStats({ total, averageAttendance: avgAttendance, topPerformers, needsSupport });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load lecturer data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...lecturers];
    
    // Search
    if (searchTerm) {
      filtered = filtered.filter(l => 
        `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(l => l.department === filterDepartment);
    }
    
    // Performance filter
    if (filterPerformance !== 'all') {
      filtered = filtered.filter(l => l.performance === filterPerformance);
    }
    
    setFilteredLecturers(filtered);
    setCurrentPage(1);
  };

  const fetchLecturerDetail = async (lecturerId) => {
    try {
      const lecturer = lecturers.find(l => l.id === lecturerId);
      if (!lecturer) return;
      
      // Get attendance for lecturer's units
      const lecturerAttendance = attendance.filter(a => 
        lecturer.units.some(u => u.id === a.unitId)
      );
      
      // Performance by course
      const courseStats = lecturer.units.map(unit => {
        const unitAttendance = attendance.filter(a => a.unitId === unit.id);
        const total = unitAttendance.length;
        const present = unitAttendance.filter(a => a.status === 'present').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        // Get enrolled students for this unit
        const enrolledStudents = new Set(unitAttendance.map(a => a.studentId)).size;
        
        return {
          unitId: unit.id,
          unitName: unit.name,
          total,
          present,
          percentage,
          enrolledStudents
        };
      });
      
      // Last 30 days trend
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAttendance = lecturerAttendance
        .filter(a => a.date && new Date(a.date) >= thirtyDaysAgo)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Group by date
      const dateMap = {};
      recentAttendance.forEach(record => {
        if (!dateMap[record.date]) {
          dateMap[record.date] = { date: record.date, total: 0, present: 0 };
        }
        dateMap[record.date].total += 1;
        if (record.status === 'present') {
          dateMap[record.date].present += 1;
        }
      });
      
      const trendData = Object.values(dateMap).map(d => ({
        date: d.date,
        percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0
      }));
      
      // Get reschedule requests for this lecturer
      const lecturerRequests = rescheduleRequests.filter(r => r.teacherId === lecturerId);
      
      setLecturerDetail({
        courseStats,
        trendData,
        rescheduleRequests: lecturerRequests
      });
      
    } catch (error) {
      console.error('Error fetching lecturer detail:', error);
    }
  };

  const toggleLecturerDetail = (lecturerId) => {
    if (expandedLecturer === lecturerId) {
      setExpandedLecturer(null);
      setLecturerDetail(null);
    } else {
      setExpandedLecturer(lecturerId);
      fetchLecturerDetail(lecturerId);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Department', 'Courses', 'Students', 'Attendance Rate', 'Total Classes', 'Present Classes', 'Performance', 'Pending Requests'];
    const rows = filteredLecturers.map(l => [
      l.id,
      `${l.firstName} ${l.lastName}`,
      l.email,
      l.department,
      l.coursesCount,
      l.studentsCount,
      `${l.attendanceRate}%`,
      l.totalClasses,
      l.presentClasses,
      l.performance,
      l.pendingRequests
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecturers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Lecturers exported successfully');
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'needs-support': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPerformanceIcon = (performance) => {
    switch (performance) {
      case 'excellent': return <Award className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'needs-support': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Pagination
  const indexOfLastLecturer = currentPage * lecturersPerPage;
  const indexOfFirstLecturer = indexOfLastLecturer - lecturersPerPage;
  const currentLecturers = filteredLecturers.slice(indexOfFirstLecturer, indexOfLastLecturer);
  const totalPages = Math.ceil(filteredLecturers.length / lecturersPerPage);

  // Get unique values for filters
  const departments = [...new Set(lecturers.map(l => l.department).filter(Boolean))];

  // Distribution data for charts
  const performanceDistribution = [
    { name: 'Excellent (≥85%)', value: stats.topPerformers, color: '#10b981' },
    { name: 'Good (70-84%)', value: lecturers.filter(l => l.performance === 'good').length, color: '#3b82f6' },
    { name: 'Needs Support (<70%)', value: stats.needsSupport, color: '#f59e0b' }
  ];

  const workloadDistribution = lecturers.map(l => ({
    id: l.id,
    name: `${l.firstName} ${l.lastName}`,
    students: l.studentsCount,
    courses: l.coursesCount
  })).sort((a, b) => b.students - a.students).slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lecturers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
          Lecturers Management
        </h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Manage and monitor all lecturers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Total Lecturers</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Users className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Average Attendance</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.averageAttendance}%</p>
            </div>
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Top Performers</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.topPerformers}</p>
            </div>
            <Award className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Needs Support</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.needsSupport}</p>
            </div>
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Distribution */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={220} className="sm:h-[250px]">
            <PieChart>
              <Pie
                data={performanceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {performanceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Workload Distribution */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Top 10 by Student Count</h3>
          <ResponsiveContainer width="100%" height={220} className="sm:h-[250px]">
            <BarChart data={workloadDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="students" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                {workloadDistribution.map((entry) => (
                  <Cell key={entry.id} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                className="w-full pl-10 pr-2 sm:pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Department Filter */}
          <select
            className="border rounded-lg px-2 sm:px-3 lg:px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Performance Filter */}
          <select
            className="border rounded-lg px-2 sm:px-3 lg:px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
            value={filterPerformance}
            onChange={(e) => setFilterPerformance(e.target.value)}
          >
            <option value="all">All Performance</option>
            <option value="excellent">Excellent (≥85%)</option>
            <option value="good">Good (70-84%)</option>
            <option value="needs-support">Needs Support (&lt;70%)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-xs sm:text-sm"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Export to CSV
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDepartment('all');
              setFilterPerformance('all');
            }}
            className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors text-xs sm:text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Lecturers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturer</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentLecturers.map(lecturer => (
                <>
                  <tr key={lecturer.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {lecturer.firstName} {lecturer.lastName}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">{lecturer.email}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {lecturer.department}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{lecturer.coursesCount}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{lecturer.studentsCount}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div 
                            className={`h-2 rounded-full ${
                              lecturer.attendanceRate >= 85 ? 'bg-green-500' :
                              lecturer.attendanceRate >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${lecturer.attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{lecturer.attendanceRate}%</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {lecturer.presentClasses}/{lecturer.totalClasses} classes
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getPerformanceColor(lecturer.performance)}`}>
                        {getPerformanceIcon(lecturer.performance)}
                        {lecturer.performance === 'needs-support' ? 'Needs Support' : lecturer.performance.charAt(0).toUpperCase() + lecturer.performance.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                      {lecturer.pendingRequests > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-orange-50 text-orange-600">
                          <Clock className="w-3 h-3" />
                          {lecturer.pendingRequests} pending
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <button
                        onClick={() => toggleLecturerDetail(lecturer.id)}
                        className="text-blue-600 hover:text-blue-800 active:text-blue-900 font-medium flex items-center gap-1"
                      >
                        {expandedLecturer === lecturer.id ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            View
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail Row */}
                  {expandedLecturer === lecturer.id && lecturerDetail && (
                    <tr>
                      <td colSpan="8" className="px-3 sm:px-4 lg:px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-800 text-lg">Lecturer Details</h4>
                          
                          {/* Courses Teaching */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Courses & Performance</h5>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {lecturerDetail.courseStats.map(course => (
                                <div key={course.unitId} className="bg-white rounded-lg p-3 border">
                                  <div className="flex justify-between items-center mb-2">
                                    <div>
                                      <span className="font-medium text-gray-800">{course.unitName}</span>
                                      <p className="text-xs text-gray-500">{course.enrolledStudents} students</p>
                                    </div>
                                    <span className={`font-bold ${
                                      course.percentage >= 85 ? 'text-green-600' : 
                                      course.percentage >= 70 ? 'text-blue-600' : 'text-yellow-600'
                                    }`}>
                                      {course.percentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        course.percentage >= 85 ? 'bg-green-500' : 
                                        course.percentage >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                                      }`}
                                      style={{ width: `${course.percentage}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {course.present}/{course.total} classes attended
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 30-day Trend */}
                          {lecturerDetail.trendData.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">30-Day Attendance Trend</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={lecturerDetail.trendData}>
                                  <defs>
                                    <linearGradient id="colorLecturerAttendance" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(date) => {
                                      try {
                                        return format(new Date(date), 'MMM dd');
                                      } catch {
                                        return date;
                                      }
                                    }}
                                  />
                                  <YAxis domain={[0, 100]} />
                                  <Tooltip 
                                    labelFormatter={(date) => {
                                      try {
                                        return format(new Date(date), 'MMM dd, yyyy');
                                      } catch {
                                        return date;
                                      }
                                    }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="percentage" 
                                    stroke="#10b981" 
                                    fillOpacity={1} 
                                    fill="url(#colorLecturerAttendance)" 
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          {/* Reschedule Requests */}
                          {lecturerDetail.rescheduleRequests.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Recent Reschedule Requests</h5>
                              <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left">Unit</th>
                                      <th className="px-4 py-2 text-left">Original</th>
                                      <th className="px-4 py-2 text-left">New Date/Time</th>
                                      <th className="px-4 py-2 text-left">Status</th>
                                      <th className="px-4 py-2 text-left">Requested</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {lecturerDetail.rescheduleRequests.slice(0, 5).map((request) => (
                                      <tr key={request.id}>
                                        <td className="px-4 py-2">{request.unitName}</td>
                                        <td className="px-4 py-2">
                                          {request.originalDay}<br/>
                                          <span className="text-xs text-gray-500">{request.originalTime}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                          {request.newDate}<br/>
                                          <span className="text-xs text-gray-500">{request.newTime}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                          }`}>
                                            {request.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2 text-xs text-gray-500">
                                          {request.requestedAt ? format(new Date(request.requestedAt), 'MMM dd') : 'N/A'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstLecturer + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastLecturer, filteredLecturers.length)}</span> of{' '}
                  <span className="font-medium">{filteredLecturers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === idx + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No results */}
      {filteredLecturers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lecturers found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AdminLecturers;
