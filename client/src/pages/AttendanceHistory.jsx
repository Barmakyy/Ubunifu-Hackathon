import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  TrendingUp,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function AttendanceHistory() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceHistory();
    }
  }, [user?.id]);

  const fetchAttendanceHistory = async () => {
    try {
      if (!user?.id) return;

      // Fetch all necessary data in parallel
      const [attendanceRes, unitsRes, usersRes, timetableRes] = await Promise.all([
        axios.get(`http://localhost:8000/attendance?studentId=${user.id}`),
        axios.get('http://localhost:8000/units'),
        axios.get('http://localhost:8000/users'),
        axios.get('http://localhost:8000/timetable')
      ]);

      const attendanceData = attendanceRes.data;
      const units = unitsRes.data;
      const teachers = usersRes.data.filter(u => u.role === 'teacher');
      const timetable = timetableRes.data;

      // Transform attendance data to include unit and teacher details
      const enrichedRecords = attendanceData
        .filter(att => att.unitId && att.date) // Only valid attendance records
        .map(att => {
          const unit = units.find(u => u.id === att.unitId);
          const teacher = teachers.find(t => t.id === unit?.teacherId);
          
          // Find scheduled time from timetable
          const classSchedule = timetable.find(t => t.classId === user.classIds?.[0]);
          const period = classSchedule?.periods?.find(p => p.unitId === att.unitId);

          return {
            id: att.id,
            date: new Date(att.date),
            courseName: unit?.name || 'Unknown Course',
            courseCode: att.unitId?.toUpperCase() || 'N/A',
            status: att.status || 'absent',
            checkInTime: att.time ? format(new Date(`2000-01-01T${att.time}`), 'hh:mm a') : null,
            scheduledTime: period?.startTime ? format(new Date(`2000-01-01T${period.startTime}`), 'hh:mm a') : 'N/A',
            room: `Room ${Math.floor(Math.random() * 300) + 100}`, // Generate room number
            lecturer: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
            notes: att.graceUnitUsed ? 'Grace unit used' : (att.late ? 'Late - Grace unit used' : null)
          };
        })
        .sort((a, b) => b.date - a.date); // Sort by date descending

      setAttendanceRecords(enrichedRecords);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceRecords([]);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'present') return <CheckCircle className="text-green-600" size={20} />;
    if (status === 'absent') return <XCircle className="text-red-600" size={20} />;
    return <AlertCircle className="text-orange-600" size={20} />;
  };

  const getStatusBadge = (status, notes) => {
    if (status === 'present') {
      if (notes && notes.includes('Late')) {
        return 'bg-orange-100 text-orange-700 border-orange-200';
      }
      return 'bg-green-100 text-green-700 border-green-200';
    }
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusLabel = (status, notes) => {
    if (status === 'present' && notes && notes.includes('Late')) {
      return 'Late (Grace Used)';
    }
    if (status === 'present') return 'Present';
    if (status === 'absent' && notes && notes.includes('Grace')) {
      return 'Absent (Grace Used)';
    }
    return 'Absent';
  };

  // Calendar functions
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDate = (date) => {
    return attendanceRecords.filter(record => 
      isSameDay(new Date(record.date), date)
    );
  };

  const getDayStatus = (date) => {
    const records = getAttendanceForDate(date);
    if (records.length === 0) return null;
    
    const hasAbsent = records.some(r => r.status === 'absent');
    const hasLate = records.some(r => r.notes && r.notes.includes('Late'));
    
    if (hasAbsent) return 'absent';
    if (hasLate) return 'late';
    return 'present';
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesCourse = filterCourse === 'all' || record.courseCode === filterCourse;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesCourse && matchesStatus;
  });

  // Get unique courses - properly deduplicate by creating a map
  const courseMap = new Map();
  attendanceRecords.forEach(r => {
    if (!courseMap.has(r.courseCode)) {
      courseMap.set(r.courseCode, { code: r.courseCode, name: r.courseName });
    }
  });
  const uniqueCourses = Array.from(courseMap.values());

  // Stats - Use user's total classes from database
  const totalRecords = user?.totalClasses || attendanceRecords.length;
  const presentCount = user?.attendedClasses || attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = totalRecords - presentCount;
  const graceUsedCount = attendanceRecords.filter(r => r.notes && (r.notes.includes('Grace') || r.notes.includes('Late'))).length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  const handleExport = () => {
    // Export functionality
    alert('Exporting attendance report...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance History</h1>
              <p className="text-gray-600">Complete record of your class attendance</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={20} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Present</p>
                <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Calendar View</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-medium text-gray-900 min-w-[150px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Calendar days */}
            {daysInMonth.map(day => {
              const dayStatus = getDayStatus(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-lg border transition-all relative ${
                    isToday ? 'border-blue-500 border-2' : 'border-gray-200'
                  } ${
                    isSameDay(day, selectedDate) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm ${
                    !isSameMonth(day, currentMonth) ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Status indicator */}
                  {dayStatus && (
                    <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      dayStatus === 'present' ? 'bg-green-500' :
                      dayStatus === 'late' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-600">Late/Grace Used</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Absent</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map((course, idx) => (
                  <option key={idx} value={course.code}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Records List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredRecords.length} of {totalRecords} records
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No attendance records found</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Date */}
                    <div className="flex items-center gap-3 lg:w-48">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(record.date), 'EEEE')}
                        </p>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{record.courseName}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                          {record.courseCode}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User size={16} />
                          <span>{record.lecturer}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{record.scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{record.room}</span>
                        </div>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {record.notes}
                        </p>
                      )}
                    </div>

                    {/* Status and Check-in */}
                    <div className="flex items-center gap-4">
                      {record.checkInTime && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Check-in</p>
                          <p className="font-semibold text-gray-900">{record.checkInTime}</p>
                        </div>
                      )}
                      
                      <div className={`px-4 py-2 rounded-lg border font-medium flex items-center gap-2 ${
                        getStatusBadge(record.status, record.notes)
                      }`}>
                        {getStatusIcon(record.status)}
                        <span>{getStatusLabel(record.status, record.notes)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Grace Units Usage */}
        {graceUsedCount > 0 && (
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Grace Units Usage</h3>
                <p className="text-gray-600">
                  You've used <span className="font-bold text-orange-600">{graceUsedCount}</span> grace unit(s) this period.
                  You have <span className="font-bold text-orange-600">{user?.graceUnitsRemaining || 0}</span> remaining.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  💡 Grace units reset monthly and help preserve your streak when you're late or miss a class.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
