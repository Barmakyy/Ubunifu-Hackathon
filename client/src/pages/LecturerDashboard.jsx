import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Users, QrCode, Download, Calendar, CheckCircle, XCircle, Clock, User, Menu, Copy, X, Mail, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

export default function LecturerDashboard() {
  const { user } = useAuthStore();
  const [todayClasses, setTodayClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [qrSession, setQrSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    perfectAttendance: 0
  });

  useEffect(() => {
    fetchTodayClasses();
    fetchLecturerStats();
  }, []);

  const fetchTodayClasses = async () => {
    try {
      setLoading(true);
      
      // Get current day of week
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = daysOfWeek[new Date().getDay()];
      
      // Fetch all units taught by this lecturer
      const unitsResponse = await api.get(`/units?teacherId=${user.id}`);
      const units = unitsResponse.data;
      
      if (units.length === 0) {
        setTodayClasses([]);
        setLoading(false);
        return;
      }
      
      // Get unique class IDs from units
      const classIds = [...new Set(units.map(u => u.classId))];
      
      // Fetch timetables for today
      const timetablePromises = classIds.map(classId =>
        api.get(`/timetable?classId=${classId}&day=${today}`)
      );
      const timetableResponses = await Promise.all(timetablePromises);
      
      // Process today's classes
      const todaySchedule = [];
      for (const response of timetableResponses) {
        const timetableEntries = response.data;
        
        for (const entry of timetableEntries) {
          if (entry.periods) {
            for (const period of entry.periods) {
              // Find the unit for this period
              const unit = units.find(u => u.id === period.unitId);
              if (unit) {
                // Fetch class info
                const classResponse = await api.get(`/classes/${entry.classId}`);
                const classInfo = classResponse.data;
                
                // Get students enrolled in this class
                const studentsResponse = await api.get(`/users?role=student`);
                const allStudents = studentsResponse.data;
                const enrolledStudents = allStudents.filter(s => 
                  s.selectedUnits && s.selectedUnits.includes(unit.id)
                );
                
                // Get today's attendance for this unit
                const todayDate = new Date().toISOString().split('T')[0];
                const attendanceResponse = await api.get(
                  `/attendance?unitId=${unit.id}&date=${todayDate}`
                );
                const todayAttendance = attendanceResponse.data;
                
                const presentCount = todayAttendance.filter(a => a.status === 'present').length;
                const enrolledCount = Math.max(enrolledStudents.length, presentCount);
                const absentCount = Math.max(0, enrolledCount - presentCount);
                
                todaySchedule.push({
                  id: unit.id,
                  name: unit.name,
                  className: classInfo.name,
                  time: `${period.startTime} - ${period.endTime}`,
                  room: `Room ${period.period}`,
                  enrolled: enrolledCount,
                  present: presentCount,
                  absent: absentCount,
                  classId: entry.classId
                });
              }
            }
          }
        }
      }
      
      setTodayClasses(todaySchedule);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch today\'s classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturerStats = async () => {
    try {
      // Fetch all units taught by this lecturer
      const unitsResponse = await api.get(`/units?teacherId=${user.id}`);
      const units = unitsResponse.data;
      
      // Get all students
      const studentsResponse = await api.get(`/users?role=student`);
      const allStudents = studentsResponse.data;
      
      // Calculate total unique students reached
      const uniqueStudents = new Set();
      units.forEach(unit => {
        const enrolledStudents = allStudents.filter(s => 
          s.selectedUnits && s.selectedUnits.includes(unit.id)
        );
        enrolledStudents.forEach(s => uniqueStudents.add(s.id));
      });
      
      // Calculate students with perfect attendance (100%)
      const perfectAttendanceStudents = allStudents.filter(s => {
        return s.totalClasses > 0 && s.attendedClasses === s.totalClasses;
      });
      
      setStats({
        totalClasses: units.length,
        totalStudents: uniqueStudents.size,
        perfectAttendance: perfectAttendanceStudents.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateQRCode = async (classItem) => {
    try {
      // Create a unique QR session
      const now = new Date();
      const date = now.toISOString().split('T')[0].replace(/-/g, '');
      const time = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);
      const qrCode = `QR-${classItem.id}-${date}-${time}`;
      
      // Calculate end time (30 minutes from now)
      const endTime = new Date(now.getTime() + 30 * 60000);
      const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      // Save QR session to database
      const sessionData = {
        id: `qr-${Date.now()}`,
        qrCode: qrCode,
        classId: classItem.classId, // The class ID
        unitId: classItem.id, // The unit ID (classItem.id is actually the unitId)
        teacherId: user.id,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        endTime: endTimeStr,
        active: true,
        scans: 0
      };

      await axios.post('http://localhost:8000/qrSessions', sessionData);
      
      setQrSession({
        ...sessionData,
        className: classItem.name,
        classDisplayName: classItem.className
      });
      
      toast.success('QR Code generated! Valid for 30 minutes.');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const copyQRCode = () => {
    if (qrSession?.qrCode) {
      navigator.clipboard.writeText(qrSession.qrCode);
      toast.success('QR code copied to clipboard!');
    }
  };

  const viewClassDetails = async (classItem) => {
    try {
      setDetailsLoading(true);
      setShowDetailsModal(true);
      setSelectedClass(classItem);

      // Get all students enrolled in this unit
      const studentsResponse = await api.get(`/users?role=student`);
      const allStudents = studentsResponse.data;
      const enrolledStudents = allStudents.filter(s => 
        s.selectedUnits && s.selectedUnits.includes(classItem.id)
      );

      // Get today's attendance for this unit
      const todayDate = new Date().toISOString().split('T')[0];
      const attendanceResponse = await api.get(
        `/attendance?unitId=${classItem.id}&date=${todayDate}`
      );
      const todayAttendance = attendanceResponse.data;

      // Merge student data with attendance status
      const studentsWithStatus = enrolledStudents.map(student => {
        const attendance = todayAttendance.find(a => a.studentId === student.id);
        const attendanceRate = student.totalClasses > 0 
          ? Math.round((student.attendedClasses / student.totalClasses) * 100)
          : 0;

        return {
          ...student,
          attendanceToday: attendance ? 'present' : 'absent',
          attendanceTime: attendance?.time || null,
          attendanceRate: attendanceRate,
          isAtRisk: attendanceRate < 75
        };
      });

      // Sort: present first, then by name
      studentsWithStatus.sort((a, b) => {
        if (a.attendanceToday === 'present' && b.attendanceToday === 'absent') return -1;
        if (a.attendanceToday === 'absent' && b.attendanceToday === 'present') return 1;
        return a.firstName.localeCompare(b.firstName);
      });

      setStudents(studentsWithStatus);
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast.error('Failed to load class details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const downloadReport = async (classId) => {
    try {
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Lecturer Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{getCurrentDate()}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Lecturer</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <User size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Today's Class - Large Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Today's Class</h2>
              
              {todayClasses.length > 0 ? (
            <div>
              {/* Course Info */}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">{todayClasses[0].name}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Clock size={14} className="sm:w-4 sm:h-4" />
                    {todayClasses[0].time}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Calendar size={14} className="sm:w-4 sm:h-4" />
                    {todayClasses[0].room}
                  </span>
                </div>
              </div>

              {/* Three Stat Boxes in a Row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="bg-green-50 rounded-lg p-2.5 sm:p-4 text-center border border-green-200">
                  <div className="flex items-center justify-center mb-1 sm:mb-2">
                    <CheckCircle size={16} className="sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-700">{todayClasses[0].present}</div>
                  <div className="text-xs text-green-600 font-medium">Present</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-2.5 sm:p-4 text-center border border-red-200">
                  <div className="flex items-center justify-center mb-1 sm:mb-2">
                    <XCircle size={16} className="sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-red-700">{todayClasses[0].absent}</div>
                  <div className="text-xs text-red-600 font-medium">Absent</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-2.5 sm:p-4 text-center border border-blue-200">
                  <div className="flex items-center justify-center mb-1 sm:mb-2">
                    <Users size={16} className="sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-700">{todayClasses[0].enrolled}</div>
                  <div className="text-xs text-blue-600 font-medium">Enrolled</div>
                </div>
              </div>

              {/* Three Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => generateQRCode(todayClasses[0])}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <QrCode size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Generate QR
                </button>
                
                <button
                  onClick={() => viewClassDetails(todayClasses[0])}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  View Details
                </button>
                
                <button
                  onClick={() => downloadReport(todayClasses[0].id)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Export
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Calendar className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm sm:text-base">No classes scheduled for today</p>
            </div>
          )}
        </div>

        {/* QR Code Display */}
        {qrSession && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 text-white">
              <h2 className="text-lg sm:text-xl font-bold">Active QR Code</h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">{qrSession.className}</p>
            </div>

            <div className="p-4 sm:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Students can scan this code to mark attendance</p>
                
                {/* QR Code */}
                <div className="inline-block p-4 sm:p-6 bg-white rounded-lg border-2 sm:border-4 border-blue-600 shadow-lg">
                  <QRCodeSVG 
                    value={qrSession.qrCode}
                    size={200}
                    className="sm:w-64 sm:h-64"
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* QR Code Text */}
                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 inline-block max-w-full">
                  <p className="text-xs text-gray-500 mb-1">QR Code:</p>
                  <p className="text-xs sm:text-sm font-mono font-bold text-gray-900 break-all">{qrSession.qrCode}</p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">Valid Until</p>
                  <p className="text-base sm:text-lg font-bold text-blue-700">{qrSession.endTime}</p>
                </div>
                <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">Students Scanned</p>
                  <p className="text-base sm:text-lg font-bold text-green-700">{qrSession.scans || 0}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={copyQRCode}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Copy size={14} className="sm:w-4 sm:h-4" />
                  Copy Code
                </button>
                <button
                  onClick={() => setQrSession(null)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-700">
                  <strong>Note:</strong> This QR code will expire in 30 minutes. Students should scan it during class to mark their attendance.
                </p>
              </div>
            </div>
          </div>
        )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Classes Taught Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center border border-gray-200">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalClasses}</div>
                <div className="text-xs sm:text-sm text-gray-600">Classes Taught</div>
              </div>
              
              {/* Students Reached Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center border border-gray-200">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalStudents}</div>
                <div className="text-xs sm:text-sm text-gray-600">Students Reached</div>
              </div>
              
              {/* Perfect Attendance Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center border border-gray-200">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.perfectAttendance}</div>
                <div className="text-xs sm:text-sm text-gray-600">Perfect Attendance</div>
              </div>
              
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedClass && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Modal Header */}
                  <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedClass.name}</h2>
                      <p className="text-xs sm:text-sm text-gray-500">{selectedClass.className}</p>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="bg-gray-50">
                    {/* Session Info */}
                    <div className="p-4 sm:p-6 bg-white">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Clock size={16} className="sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-gray-600" />
                          <div className="text-xs text-gray-600 mb-1">Time</div>
                          <div className="text-sm sm:text-base font-bold text-gray-900 truncate">{selectedClass.time}</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle size={16} className="sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-green-600" />
                          <div className="text-xs text-gray-600 mb-1">Present</div>
                          <div className="text-sm sm:text-base font-bold text-green-700">{selectedClass.present}</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                          <XCircle size={16} className="sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-red-600" />
                          <div className="text-xs text-gray-600 mb-1">Absent</div>
                          <div className="text-sm sm:text-base font-bold text-red-700">{selectedClass.absent}</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Users size={16} className="sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-blue-600" />
                          <div className="text-xs text-gray-600 mb-1">Rate</div>
                          <div className="text-sm sm:text-base font-bold text-blue-700">
                            {selectedClass.enrolled > 0 ? Math.round((selectedClass.present / selectedClass.enrolled) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Students List */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Student Attendance</h3>
                      
                      {detailsLoading ? (
                        <div className="bg-white rounded-lg p-8 sm:p-12 text-center border border-gray-200">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-sm sm:text-base text-gray-600">Loading students...</p>
                        </div>
                      ) : students.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 sm:p-12 text-center text-gray-500 border border-gray-200">
                          <Users className="mx-auto mb-2 opacity-50" size={32} />
                          <p className="text-sm sm:text-base">No students enrolled in this class</p>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {students.map((student) => (
                            <div
                              key={student.id}
                              className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:justify-between">
                                <div className="flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
                                  {/* Avatar */}
                                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    student.attendanceToday === 'present' ? 'bg-green-600' : 'bg-gray-300'
                                  }`}>
                                    <User size={20} className="sm:w-6 sm:h-6 text-white" />
                                  </div>

                                  {/* Student Info */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                        {student.firstName} {student.lastName}
                                      </h4>
                                      {student.isAtRisk && (
                                        <span className="px-1.5 sm:px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded flex items-center gap-1 flex-shrink-0">
                                          <AlertCircle size={10} className="sm:w-3 sm:h-3" />
                                          At Risk
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">{student.email}</p>
                                    {student.attendanceTime && (
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        Marked at {student.attendanceTime}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 w-full sm:w-auto">
                                  {/* Attendance Stats */}
                                  <div className="text-left sm:text-right">
                                    <div className="flex items-center gap-1 sm:justify-end mb-0.5 sm:mb-1">
                                      <TrendingUp size={12} className={`sm:w-3.5 sm:h-3.5 ${student.attendanceRate >= 75 ? 'text-green-600' : 'text-orange-600'}`} />
                                      <span className={`text-xs sm:text-sm font-bold ${
                                        student.attendanceRate >= 90 ? 'text-green-600' :
                                        student.attendanceRate >= 75 ? 'text-blue-600' :
                                        'text-orange-600'
                                      }`}>
                                        {student.attendanceRate}%
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {student.attendedClasses}/{student.totalClasses} classes
                                    </p>
                                    {student.streak > 0 && (
                                      <p className="text-xs text-blue-600 font-medium mt-0.5 sm:mt-1">
                                        🔥 {student.streak} day streak
                                      </p>
                                    )}
                                  </div>

                                  {/* Status Badge */}
                                  <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] text-center flex-shrink-0 ${
                                    student.attendanceToday === 'present'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-red-600 text-white'
                                  }`}>
                                    {student.attendanceToday === 'present' ? 'Present' : 'Absent'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-white flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
                    <button
                      onClick={() => downloadReport(selectedClass.id)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <Download size={14} className="sm:w-4 sm:h-4" />
                      Export Report
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
