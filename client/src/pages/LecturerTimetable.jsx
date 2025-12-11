import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Calendar, Clock, Plus, Edit2, X, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LecturerTimetable() {
  const { user } = useAuthStore();
  const [timetable, setTimetable] = useState({});
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newTime: '',
    reason: ''
  });
  const [makeupData, setMakeupData] = useState({
    unitId: '',
    date: '',
    startTime: '',
    endTime: '',
    reason: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);

      // Fetch lecturer's units
      const unitsResponse = await api.get(`/units?teacherId=${user.id}`);
      const lecturerUnits = unitsResponse.data;
      setUnits(lecturerUnits);

      // Fetch classes for these units
      const classIds = [...new Set(lecturerUnits.map(u => u.classId))];
      const timetableData = {};

      for (const classId of classIds) {
        const timetableResponse = await api.get(`/timetable?classId=${classId}`);
        const entries = timetableResponse.data;

        entries.forEach(entry => {
          if (!timetableData[entry.day]) {
            timetableData[entry.day] = [];
          }

          // Filter periods for lecturer's units only
          const lecturerPeriods = entry.periods?.filter(period =>
            lecturerUnits.some(u => u.id === period.unitId)
          ) || [];

          lecturerPeriods.forEach(period => {
            const unit = lecturerUnits.find(u => u.id === period.unitId);
            if (unit) {
              timetableData[entry.day].push({
                ...period,
                unitName: unit.name,
                unitId: unit.id,
                classId: entry.classId
              });
            }
          });
        });
      }

      // Sort periods by start time for each day
      Object.keys(timetableData).forEach(day => {
        timetableData[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      setTimetable(timetableData);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const requestReschedule = async () => {
    if (!rescheduleData.newDate || !rescheduleData.newTime || !rescheduleData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Create reschedule request
      const request = {
        id: `reschedule-${Date.now()}`,
        teacherId: user.id,
        teacherName: `${user.firstName} ${user.lastName}`,
        unitId: selectedSession.unitId,
        unitName: selectedSession.unitName,
        classId: selectedSession.classId,
        originalDay: selectedSession.day,
        originalTime: `${selectedSession.startTime} - ${selectedSession.endTime}`,
        newDate: rescheduleData.newDate,
        newTime: rescheduleData.newTime,
        reason: rescheduleData.reason,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        type: 'reschedule'
      };

      await api.post('/rescheduleRequests', request);

      // Get affected students
      const studentsResponse = await api.get(`/users?role=student`);
      const allStudents = studentsResponse.data;
      const affectedStudents = allStudents.filter(s =>
        s.selectedUnits && s.selectedUnits.includes(selectedSession.unitId)
      );

      // Create notifications for students
      const notifications = affectedStudents.map(student => ({
        id: `notif-${Date.now()}-${student.id}`,
        userId: student.id,
        type: 'schedule',
        title: 'Class Rescheduled',
        message: `${selectedSession.unitName} has been rescheduled to ${new Date(rescheduleData.newDate).toLocaleDateString()} at ${rescheduleData.newTime}. Reason: ${rescheduleData.reason}`,
        read: false,
        timestamp: new Date().toISOString()
      }));

      await Promise.all(notifications.map(n => api.post('/notifications', n)));

      toast.success('Reschedule request submitted and students notified');
      setShowRescheduleModal(false);
      setRescheduleData({ newDate: '', newTime: '', reason: '' });
    } catch (error) {
      console.error('Error submitting reschedule request:', error);
      toast.error('Failed to submit request');
    }
  };

  const scheduleMakeupClass = async () => {
    if (!makeupData.unitId || !makeupData.date || !makeupData.startTime || !makeupData.endTime || !makeupData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const unit = units.find(u => u.id === makeupData.unitId);
      
      // Create makeup class entry
      const makeupClass = {
        id: `makeup-${Date.now()}`,
        teacherId: user.id,
        teacherName: `${user.firstName} ${user.lastName}`,
        unitId: makeupData.unitId,
        unitName: unit.name,
        classId: unit.classId,
        date: makeupData.date,
        startTime: makeupData.startTime,
        endTime: makeupData.endTime,
        reason: makeupData.reason,
        type: 'makeup',
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      await api.post('/makeupClasses', makeupClass);

      // Get affected students
      const studentsResponse = await api.get(`/users?role=student`);
      const allStudents = studentsResponse.data;
      const affectedStudents = allStudents.filter(s =>
        s.selectedUnits && s.selectedUnits.includes(makeupData.unitId)
      );

      // Create notifications for students
      const notifications = affectedStudents.map(student => ({
        id: `notif-${Date.now()}-${student.id}`,
        userId: student.id,
        type: 'schedule',
        title: 'Makeup Class Scheduled',
        message: `A makeup class for ${unit.name} has been scheduled on ${new Date(makeupData.date).toLocaleDateString()} at ${makeupData.startTime} - ${makeupData.endTime}. Reason: ${makeupData.reason}`,
        read: false,
        timestamp: new Date().toISOString()
      }));

      await Promise.all(notifications.map(n => api.post('/notifications', n)));

      toast.success('Makeup class scheduled and students notified');
      setShowMakeupModal(false);
      setMakeupData({ unitId: '', date: '', startTime: '', endTime: '', reason: '' });
    } catch (error) {
      console.error('Error scheduling makeup class:', error);
      toast.error('Failed to schedule makeup class');
    }
  };

  const openRescheduleModal = (session, day) => {
    setSelectedSession({ ...session, day });
    setShowRescheduleModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
              <p className="text-sm text-gray-500">View and manage your class schedule</p>
            </div>
            <button
              onClick={() => setShowMakeupModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Schedule Makeup Class
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Loading timetable...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Day</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {daysOfWeek.map(day => (
                    <tr key={day} className="hover:bg-gray-50">
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="font-medium text-gray-900">{day}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {timetable[day] && timetable[day].length > 0 ? (
                          <div className="space-y-3">
                            {timetable[day].map((session, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                              >
                                <div>
                                  <h4 className="font-semibold text-gray-900">{session.unitName}</h4>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Clock size={14} />
                                      {session.startTime} - {session.endTime}
                                    </span>
                                    <span>Room {session.period}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => openRescheduleModal(session, day)}
                                  className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                                >
                                  <Edit2 size={14} />
                                  Reschedule
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No classes scheduled</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Request Reschedule</h2>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1">Submit a schedule change request</p>
                </div>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5 space-y-5">
              {/* Current Schedule Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={18} className="text-blue-600 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedSession?.unitName}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Current:</span> {selectedSession?.day}, {selectedSession?.startTime} - {selectedSession?.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* New Date Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="reschedule-date">
                  New Date <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 text-sm sm:text-base"
                  required
                />
              </div>

              {/* New Time Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="reschedule-time">
                  New Time <span className="text-red-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="reschedule-time"
                    type="text"
                    placeholder="e.g., 10:00 - 11:00"
                    value={rescheduleData.newTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                    className="w-full pl-10 pr-3 sm:pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Reason Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="reschedule-reason">
                  Reason for Reschedule <span className="text-red-500" aria-label="required">*</span>
                </label>
                <textarea
                  id="reschedule-reason"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  rows={4}
                  placeholder="Explain why you need to reschedule this class..."
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Notification Alert */}
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Bell size={16} className="text-amber-600 mt-0.5 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Automatic Notification</p>
                  <p className="text-xs text-gray-600 mt-1">
                    All enrolled students will be automatically notified about this schedule change.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={requestReschedule}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Makeup Class Modal */}
      {showMakeupModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Schedule Makeup Class</h2>
                  <p className="text-xs sm:text-sm text-green-100 mt-1">Add a makeup session for missed classes</p>
                </div>
                <button
                  onClick={() => setShowMakeupModal(false)}
                  className="text-white hover:bg-green-800 p-2 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5 space-y-5">
              {/* Unit Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="makeup-unit">
                  Select Unit <span className="text-red-500" aria-label="required">*</span>
                </label>
                <select
                  id="makeup-unit"
                  value={makeupData.unitId}
                  onChange={(e) => setMakeupData({ ...makeupData, unitId: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 bg-white text-sm sm:text-base"
                  required
                >
                  <option value="">Choose a unit...</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="makeup-date">
                  Date <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="makeup-date"
                  type="date"
                  value={makeupData.date}
                  onChange={(e) => setMakeupData({ ...makeupData, date: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="makeup-start-time">
                    Start Time <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <input
                    id="makeup-start-time"
                    type="time"
                    value={makeupData.startTime}
                    onChange={(e) => setMakeupData({ ...makeupData, startTime: e.target.value })}
                    className="w-full px-2 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="makeup-end-time">
                    End Time <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <input
                    id="makeup-end-time"
                    type="time"
                    value={makeupData.endTime}
                    onChange={(e) => setMakeupData({ ...makeupData, endTime: e.target.value })}
                    className="w-full px-2 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Reason Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="makeup-reason">
                  Reason for Makeup <span className="text-red-500" aria-label="required">*</span>
                </label>
                <textarea
                  id="makeup-reason"
                  value={makeupData.reason}
                  onChange={(e) => setMakeupData({ ...makeupData, reason: e.target.value })}
                  rows={4}
                  placeholder="Why is this makeup class needed? (e.g., Making up for missed session on Dec 5)"
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none transition-all text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Notification Alert */}
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Automatic Notification</p>
                  <p className="text-xs text-gray-600 mt-1">
                    All enrolled students will be notified automatically about this makeup class.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setShowMakeupModal(false)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={scheduleMakeupClass}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                Schedule Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
