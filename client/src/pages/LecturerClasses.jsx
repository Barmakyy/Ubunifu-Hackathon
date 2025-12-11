import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Users, TrendingUp, Calendar, Clock, Search, Filter, ChevronRight, AlertCircle, CheckCircle, BarChart } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LecturerClasses() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      // Fetch all units taught by this lecturer
      const unitsResponse = await api.get(`/units?teacherId=${user.id}`);
      const units = unitsResponse.data;

      // Fetch all students
      const studentsResponse = await api.get(`/users?role=student`);
      const allStudents = studentsResponse.data;

      // Fetch all attendance records for these units
      const attendancePromises = units.map(unit =>
        api.get(`/attendance?unitId=${unit.id}`)
      );
      const attendanceResponses = await Promise.all(attendancePromises);

      // Process each unit with stats
      const classesWithStats = await Promise.all(
        units.map(async (unit, index) => {
          // Get class info
          const classResponse = await api.get(`/classes/${unit.classId}`);
          const classInfo = classResponse.data;

          // Get enrolled students
          const enrolledStudents = allStudents.filter(s =>
            s.selectedUnits && s.selectedUnits.includes(unit.id)
          );

          // Calculate attendance stats
          const attendanceRecords = attendanceResponses[index].data;
          const totalSessions = [...new Set(attendanceRecords.map(a => a.date))].length;
          const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
          const possibleAttendance = enrolledStudents.length * totalSessions;
          const attendanceRate = possibleAttendance > 0 
            ? Math.round((presentCount / possibleAttendance) * 100)
            : 0;

          // Count at-risk students (< 75% attendance)
          const atRiskCount = enrolledStudents.filter(s => {
            const rate = s.totalClasses > 0 
              ? (s.attendedClasses / s.totalClasses) * 100
              : 0;
            return rate < 75;
          }).length;

          // Get timetable info
          const timetableResponse = await api.get(`/timetable?classId=${unit.classId}`);
          const timetable = timetableResponse.data[0];
          const schedule = timetable?.periods?.find(p => p.unitId === unit.id);

          return {
            id: unit.id,
            name: unit.name,
            className: classInfo.name,
            classId: unit.classId,
            enrolledCount: enrolledStudents.length,
            attendanceRate: attendanceRate,
            atRiskCount: atRiskCount,
            totalSessions: totalSessions,
            day: timetable?.day || 'Not scheduled',
            time: schedule ? `${schedule.startTime} - ${schedule.endTime}` : 'TBA'
          };
        })
      );

      setClasses(classesWithStats);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const viewClassDetails = async (classItem) => {
    try {
      setSelectedClass(classItem);

      // Fetch students enrolled in this unit
      const studentsResponse = await api.get(`/users?role=student`);
      const allStudents = studentsResponse.data;
      const enrolledStudents = allStudents.filter(s =>
        s.selectedUnits && s.selectedUnits.includes(classItem.id)
      );

      // Get attendance records for this unit
      const attendanceResponse = await api.get(`/attendance?unitId=${classItem.id}`);
      const attendanceRecords = attendanceResponse.data;

      // Calculate stats for each student
      const studentsWithStats = enrolledStudents.map(student => {
        const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);
        const totalSessions = classItem.totalSessions;
        const attended = studentAttendance.filter(a => a.status === 'present').length;
        const attendanceRate = totalSessions > 0
          ? Math.round((attended / totalSessions) * 100)
          : 0;

        return {
          ...student,
          sessionsAttended: attended,
          sessionsMissed: totalSessions - attended,
          unitAttendanceRate: attendanceRate,
          overallAttendanceRate: student.totalClasses > 0
            ? Math.round((student.attendedClasses / student.totalClasses) * 100)
            : 0,
          isAtRisk: attendanceRate < 75
        };
      });

      // Sort by attendance rate (lowest first to highlight at-risk students)
      studentsWithStats.sort((a, b) => a.unitAttendanceRate - b.unitAttendanceRate);

      setStudents(studentsWithStats);
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast.error('Failed to load class details');
    }
  };

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedClass) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setSelectedClass(null)}
              className="text-blue-600 hover:text-blue-700 active:text-blue-800 text-xs sm:text-sm font-medium mb-2 flex items-center gap-1"
            >
              ← Back to All Classes
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedClass.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500">{selectedClass.className}</p>
          </div>
        </div>

        {/* Class Stats */}
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedClass.enrolledCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} className="sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Attendance Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedClass.attendanceRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">At Risk</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedClass.atRiskCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Sessions Held</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedClass.totalSessions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Student Roster</h2>
              <p className="text-xs sm:text-sm text-gray-500">View individual student performance</p>
            </div>

            <div className="p-4 sm:p-6">
              {students.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Users className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-sm sm:text-base">No students enrolled in this class</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 sm:p-4 rounded-lg border ${
                        student.isAtRisk
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:justify-between">
                        <div className="flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 ${
                            student.unitAttendanceRate >= 90 ? 'bg-green-600' :
                            student.unitAttendanceRate >= 75 ? 'bg-blue-600' :
                            'bg-orange-600'
                          }`}>
                            {student.firstName[0]}{student.lastName[0]}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                {student.firstName} {student.lastName}
                              </h3>
                              {student.isAtRisk && (
                                <span className="px-1.5 sm:px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded flex items-center gap-1 flex-shrink-0">
                                  <AlertCircle size={10} className="sm:w-3 sm:h-3" />
                                  At Risk
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{student.email}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                              <p className="text-xs text-gray-600">
                                This unit: {student.sessionsAttended}/{selectedClass.totalSessions} sessions
                              </p>
                              <p className="text-xs text-gray-600">
                                Overall: {student.attendedClasses}/{student.totalClasses} classes
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <div className="flex items-center gap-1.5 sm:gap-2 sm:justify-end mb-0.5 sm:mb-1">
                            <BarChart size={14} className={
                              `sm:w-4 sm:h-4 ${student.unitAttendanceRate >= 75 ? 'text-green-600' : 'text-orange-600'}`
                            } />
                            <span className={`text-lg sm:text-xl font-bold ${
                              student.unitAttendanceRate >= 90 ? 'text-green-600' :
                              student.unitAttendanceRate >= 75 ? 'text-blue-600' :
                              'text-orange-600'
                            }`}>
                              {student.unitAttendanceRate}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Unit attendance</p>
                          {student.streak > 0 && (
                            <p className="text-xs text-blue-600 font-medium mt-0.5 sm:mt-1">
                              🔥 {student.streak} day streak
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage and monitor all your classes</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <BookOpen className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm sm:text-base text-gray-600">No classes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md active:shadow-lg transition-shadow cursor-pointer"
                onClick={() => viewClassDetails(classItem)}
              >
                <div className="p-4 sm:p-6">
                  {/* Class Header */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">{classItem.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{classItem.className}</p>
                    </div>
                    <ChevronRight className="text-gray-400 flex-shrink-0" size={18} />
                  </div>

                  {/* Schedule */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <Calendar size={14} className="sm:w-4 sm:h-4" />
                    <span className="truncate">{classItem.day}</span>
                    <Clock size={14} className="sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    <span className="truncate">{classItem.time}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-lg sm:text-xl font-bold text-blue-700">{classItem.enrolledCount}</p>
                      <p className="text-xs text-blue-600">Students</p>
                    </div>
                    <div className={`text-center p-2 sm:p-3 rounded-lg border ${
                      classItem.attendanceRate >= 75
                        ? 'bg-green-50 border-green-200'
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <p className={`text-lg sm:text-xl font-bold ${
                        classItem.attendanceRate >= 75 ? 'text-green-700' : 'text-orange-700'
                      }`}>{classItem.attendanceRate}%</p>
                      <p className={`text-xs ${
                        classItem.attendanceRate >= 75 ? 'text-green-600' : 'text-orange-600'
                      }`}>Rate</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-lg sm:text-xl font-bold text-orange-700">{classItem.atRiskCount}</p>
                      <p className="text-xs text-orange-600">At Risk</p>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      {classItem.totalSessions} sessions held
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
