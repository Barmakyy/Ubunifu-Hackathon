import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Download, TrendingDown, TrendingUp, 
  AlertCircle, CheckCircle, Mail, FileText, ChevronDown, ChevronUp,
  Calendar, BookOpen, Award, XCircle
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // good, warning, critical
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    averageAttendance: 0,
    atRisk: 0,
    excellent: 0
  });
  
  // Expanded student detail
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterProgram, filterYear, filterDepartment, filterGender, filterStatus, students]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, attendanceRes, unitsRes] = await Promise.all([
        api.get('/users'),
        api.get('/attendance'),
        api.get('/units')
      ]);

      const studentsData = usersRes.data.filter(u => u.role === 'student');
      
      // Calculate attendance for each student
      const studentsWithStats = studentsData.map(student => {
        const studentAttendance = attendanceRes.data.filter(a => a.studentId === student.id);
        const totalClasses = studentAttendance.length;
        const presentClasses = studentAttendance.filter(a => a.status === 'present').length;
        const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
        
        let status = 'good';
        if (attendanceRate < 60) status = 'critical';
        else if (attendanceRate < 75) status = 'warning';
        else if (attendanceRate >= 90) status = 'excellent';
        
        return {
          ...student,
          totalClasses,
          presentClasses,
          attendanceRate,
          status
        };
      });

      setStudents(studentsWithStats);
      setAttendance(attendanceRes.data);
      setUnits(unitsRes.data);
      
      // Calculate overall stats
      const total = studentsWithStats.length;
      const avgAttendance = total > 0 
        ? Math.round(studentsWithStats.reduce((sum, s) => sum + s.attendanceRate, 0) / total) 
        : 0;
      const atRisk = studentsWithStats.filter(s => s.attendanceRate < 75).length;
      const excellent = studentsWithStats.filter(s => s.attendanceRate >= 90).length;
      
      setStats({ total, averageAttendance: avgAttendance, atRisk, excellent });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];
    
    // Search
    if (searchTerm) {
      filtered = filtered.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Program filter
    if (filterProgram !== 'all') {
      filtered = filtered.filter(s => s.program === filterProgram);
    }
    
    // Year filter
    if (filterYear !== 'all') {
      filtered = filtered.filter(s => s.year === parseInt(filterYear));
    }
    
    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(s => s.department === filterDepartment);
    }
    
    // Gender filter
    if (filterGender !== 'all') {
      filtered = filtered.filter(s => s.gender === filterGender);
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    
    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const fetchStudentDetail = async (studentId) => {
    try {
      const studentAttendance = attendance.filter(a => a.studentId === studentId);
      
      // Group by unit
      const unitStats = {};
      studentAttendance.forEach(record => {
        if (!unitStats[record.unitId]) {
          const unit = units.find(u => u.id === record.unitId);
          unitStats[record.unitId] = {
            unitName: unit?.name || 'Unknown',
            total: 0,
            present: 0
          };
        }
        unitStats[record.unitId].total += 1;
        if (record.status === 'present') {
          unitStats[record.unitId].present += 1;
        }
      });
      
      const unitStatsArray = Object.entries(unitStats).map(([unitId, data]) => ({
        unitId,
        unitName: data.unitName,
        total: data.total,
        present: data.present,
        percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
      }));
      
      // Last 30 days trend
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAttendance = studentAttendance
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
      
      setStudentDetail({
        unitStats: unitStatsArray,
        trendData,
        recentAttendance: recentAttendance.slice(-10).reverse()
      });
      
    } catch (error) {
      console.error('Error fetching student detail:', error);
    }
  };

  const toggleStudentDetail = (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
      setStudentDetail(null);
    } else {
      setExpandedStudent(studentId);
      fetchStudentDetail(studentId);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Program', 'Year', 'Department', 'Gender', 'Attendance Rate', 'Total Classes', 'Present Classes', 'Status'];
    const rows = filteredStudents.map(s => [
      s.id,
      `${s.firstName} ${s.lastName}`,
      s.email,
      s.program,
      s.year,
      s.department,
      s.gender,
      `${s.attendanceRate}%`,
      s.totalClasses,
      s.presentClasses,
      s.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Students exported successfully');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return <Award className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Get unique values for filters
  const programs = [...new Set(students.map(s => s.program).filter(Boolean))];
  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];

  // Distribution data for charts
  const yearDistribution = [1, 2, 3, 4].map(year => ({
    name: `Year ${year}`,
    count: students.filter(s => s.year === year).length
  }));

  const statusDistribution = [
    { name: 'Excellent (≥90%)', value: stats.excellent, color: '#10b981' },
    { name: 'Good (75-89%)', value: students.filter(s => s.status === 'good').length, color: '#3b82f6' },
    { name: 'Warning (60-74%)', value: students.filter(s => s.status === 'warning').length, color: '#f59e0b' },
    { name: 'Critical (<60%)', value: students.filter(s => s.status === 'critical').length, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
          <span>Students Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and monitor all students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Total Students</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Users className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Avg Attendance</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.averageAttendance}%</p>
            </div>
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">At Risk</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.atRisk}</p>
            </div>
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Excellent ≥90%</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.excellent}</p>
            </div>
            <Award className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Year Distribution */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Students by Year</h3>
          <ResponsiveContainer width="100%" height={220} className="sm:h-[250px]">
            <BarChart data={yearDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Attendance Status</h3>
          <ResponsiveContainer width="100%" height={220} className="sm:h-[250px]">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Program Filter */}
          <select
            className="border rounded-lg px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
          >
            <option value="all">All Programs</option>
            {programs.map(prog => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            className="border rounded-lg px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          {/* Gender Filter */}
          <select
            className="border rounded-lg px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Status Filter */}
          <select
            className="border rounded-lg px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="excellent">Excellent ≥90%</option>
            <option value="good">Good 75-89%</option>
            <option value="warning">Warning 60-74%</option>
            <option value="critical">Critical &lt;60%</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Export to CSV</span>
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterProgram('all');
              setFilterYear('all');
              setFilterDepartment('all');
              setFilterGender('all');
              setFilterStatus('all');
            }}
            className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStudents.map(student => (
                <>
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[150px]">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {student.program || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      Year {student.year || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {student.gender || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 w-16 sm:w-20">
                          <div 
                            className={`h-1.5 sm:h-2 rounded-full ${
                              student.attendanceRate >= 90 ? 'bg-green-500' :
                              student.attendanceRate >= 75 ? 'bg-blue-500' :
                              student.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{student.attendanceRate}%</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {student.presentClasses}/{student.totalClasses} classes
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(student.status)}`}>
                        {getStatusIcon(student.status)}
                        <span className="hidden sm:inline">{student.status.charAt(0).toUpperCase() + student.status.slice(1)}</span>
                        <span className="sm:hidden">{student.status.charAt(0).toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <button
                        onClick={() => toggleStudentDetail(student.id)}
                        className="text-blue-600 hover:text-blue-800 active:text-blue-900 font-medium flex items-center gap-1"
                      >
                        {expandedStudent === student.id ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Hide</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">View</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail Row */}
                  {expandedStudent === student.id && studentDetail && (
                    <tr>
                      <td colSpan="7" className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50">
                        <div className="space-y-3 sm:space-y-4">
                          <h4 className="font-semibold text-gray-800 text-base sm:text-lg">Student Details</h4>
                          
                          {/* Attendance by Unit */}
                          <div>
                            <h5 className="font-medium text-gray-700 text-sm sm:text-base mb-2">Attendance by Course</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              {studentDetail.unitStats.map(unit => (
                                <div key={unit.unitId} className="bg-white rounded-lg p-3 border">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-800">{unit.unitName}</span>
                                    <span className={`font-bold ${
                                      unit.percentage >= 75 ? 'text-green-600' : 
                                      unit.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                      {unit.percentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        unit.percentage >= 75 ? 'bg-green-500' : 
                                        unit.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${unit.percentage}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {unit.present}/{unit.total} classes attended
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 30-day Trend */}
                          {studentDetail.trendData.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">30-Day Attendance Trend</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={studentDetail.trendData}>
                                  <defs>
                                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                                    stroke="#3b82f6" 
                                    fillOpacity={1} 
                                    fill="url(#colorAttendance)" 
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          {/* Recent Attendance */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Recent Attendance Records</h5>
                            <div className="bg-white rounded-lg border overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Date</th>
                                    <th className="px-4 py-2 text-left">Time</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {studentDetail.recentAttendance.map((record, idx) => (
                                    <tr key={idx}>
                                      <td className="px-4 py-2">
                                        {record.date ? format(new Date(record.date), 'MMM dd, yyyy') : 'N/A'}
                                      </td>
                                      <td className="px-4 py-2">{record.time || 'N/A'}</td>
                                      <td className="px-4 py-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {record.status === 'present' ? 'Present' : 'Absent'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
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
          <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between gap-2 sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center text-xs text-gray-600">
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
                  Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastStudent, filteredStudents.length)}</span> of{' '}
                  <span className="font-medium">{filteredStudents.length}</span> results
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
      {filteredStudents.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
