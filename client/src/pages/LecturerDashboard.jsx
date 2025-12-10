import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Users, QrCode, Download, Calendar, CheckCircle, XCircle, Clock, User, Menu } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LecturerDashboard() {
  const { user } = useAuthStore();
  const [todayClasses, setTodayClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [qrSession, setQrSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayClasses();
  }, []);

  const fetchTodayClasses = async () => {
    try {
      // Mock data - replace with actual API call
      const classes = [
        {
          id: 'class1',
          name: 'Programming 101',
          time: '08:00 - 09:00',
          room: 'Lab 1',
          enrolled: 45,
          present: 42,
          absent: 3
        },
        {
          id: 'class2',
          name: 'Discrete Mathematics',
          time: '09:15 - 10:15',
          room: 'Room 203',
          enrolled: 38,
          present: 35,
          absent: 3
        }
      ];
      setTodayClasses(classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (classId) => {
    try {
      toast.success('QR Code generated! Valid for 30 minutes.');
      setQrSession({ classId, qrCode: '🔲', endTime: '09:30' });
    } catch (error) {
      toast.error('Failed to generate QR code');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{getCurrentDate()}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Today's Class - Large Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Class</h2>
          
          {todayClasses.length > 0 && (
            <div>
              {/* Course Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{todayClasses[0].name}</h3>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {todayClasses[0].time}
                  </span>
                  <span className="flex items-center gap-2">
                    📍 {todayClasses[0].room}
                  </span>
                </div>
              </div>

              {/* Three Stat Boxes in a Row - Pastel Colors */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">{todayClasses[0].present}</div>
                  <div className="text-sm text-green-600 font-medium">Present</div>
                </div>
                
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                  <div className="flex items-center justify-center mb-2">
                    <XCircle size={24} className="text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-700">{todayClasses[0].absent}</div>
                  <div className="text-sm text-red-600 font-medium">Absent</div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="flex items-center justify-center mb-2">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{todayClasses[0].enrolled}</div>
                  <div className="text-sm text-blue-600 font-medium">Enrolled</div>
                </div>
              </div>

              {/* Three Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => generateQRCode(todayClasses[0].id)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode size={18} />
                  Generate QR
                </button>
                
                <button
                  onClick={() => setSelectedClass(todayClasses[0])}
                  className="flex-1 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                >
                  View Details
                </button>
                
                <button
                  onClick={() => downloadReport(todayClasses[0].id)}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Display */}
        {qrSession && (
          <div className="bg-white rounded-[1.5rem] shadow-xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-dusty-800 mb-4">Active QR Code</h2>
              <p className="text-dusty-600 mb-6">Students can scan this code to mark attendance</p>
              
              <div className="w-64 h-64 mx-auto bg-dusty-100 rounded-2xl flex items-center justify-center mb-6">
                {/* In production, use a QR code library like qrcode.react */}
                <div className="text-6xl">{qrSession.qrCode}</div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="px-4 py-2 bg-sage-100 rounded-lg">
                  <span className="text-sm text-sage-700 font-medium">Valid until: </span>
                  <span className="text-sm text-sage-800 font-bold">{qrSession.endTime}</span>
                </div>
                <div className="px-4 py-2 bg-violet-100 rounded-lg">
                  <span className="text-sm text-violet-700 font-medium">Scans: </span>
                  <span className="text-sm text-violet-800 font-bold">{qrSession.scans || 0}</span>
                </div>
              </div>

              <button
                onClick={() => setQrSession(null)}
                className="px-6 py-3 bg-coral-500 text-white rounded-xl font-medium hover:bg-coral-600 transition-colors"
              >
                Close QR Code
              </button>
            </div>
          </div>
        )}

        {/* Three Summary Cards in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Classes Taught Card */}
          <div className="bg-white rounded-2xl shadow p-6 text-center border border-gray-100">
            <div className="text-4xl font-bold text-gray-900 mb-2">15</div>
            <div className="text-sm text-gray-600 font-medium">Classes Taught</div>
          </div>
          
          {/* Students Reached Card */}
          <div className="bg-white rounded-2xl shadow p-6 text-center border border-gray-100">
            <div className="text-4xl font-bold text-gray-900 mb-2">138</div>
            <div className="text-sm text-gray-600 font-medium">Students Reached</div>
          </div>
          
          {/* Perfect Attendance Card */}
          <div className="bg-white rounded-2xl shadow p-6 text-center border border-gray-100">
            <div className="text-4xl font-bold text-gray-900 mb-2">8</div>
            <div className="text-sm text-gray-600 font-medium">Perfect Attendance</div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
