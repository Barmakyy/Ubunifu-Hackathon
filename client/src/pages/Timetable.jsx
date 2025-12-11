import { useState, useEffect } from 'react';
import { timetableAPI } from '../utils/api';
import { Plus, Upload, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function Timetable() {
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'class',
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    location: '',
    instructor: '',
    course: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const { data } = await timetableAPI.getAll();
      setEntries(data);
    } catch (error) {
      toast.error('Failed to load timetable');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await timetableAPI.update(editingEntry._id, formData);
        toast.success('Entry updated');
      } else {
        await timetableAPI.create(formData);
        toast.success('Entry added');
      }
      setShowModal(false);
      resetForm();
      fetchTimetable();
    } catch (error) {
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await timetableAPI.delete(id);
      toast.success('Entry deleted');
      fetchTimetable();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      type: entry.type,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      location: entry.location || '',
      instructor: entry.instructor || '',
      course: entry.course || '',
      color: entry.color
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEntry(null);
    setFormData({
      title: '',
      type: 'class',
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      location: '',
      instructor: '',
      course: '',
      color: '#3b82f6'
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await timetableAPI.uploadCSV(formData);
      toast.success(`${data.count} entries uploaded!`);
      fetchTimetable();
    } catch (error) {
      toast.error('Failed to upload CSV');
    }
  };

  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.dayOfWeek]) acc[entry.dayOfWeek] = [];
    acc[entry.dayOfWeek].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Timetable</h1>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer
            hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2">
            <Upload size={16} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Upload CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700
              active:bg-primary-800 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Add Entry</span>
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => (
          <div key={day} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 text-center">
              {DAYS[day]}
            </h3>
            <div className="space-y-1.5 sm:space-y-2">
              {(groupedEntries[day] || [])
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((entry) => (
                  <div
                    key={entry._id}
                    className="p-2 sm:p-3 rounded-lg border-l-4 bg-gray-50"
                    style={{ borderLeftColor: entry.color }}
                  >
                    <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                          {entry.title}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                          {entry.startTime} - {entry.endTime}
                        </p>
                        {entry.location && (
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{entry.location}</p>
                        )}
                      </div>
                      <div className="flex gap-0.5 sm:gap-1">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1 text-gray-600 hover:text-primary-600 active:text-primary-700"
                        >
                          <Edit2 size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-1 text-gray-600 hover:text-red-600 active:text-red-700"
                        >
                          <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {(!groupedEntries[day] || groupedEntries[day].length === 0) && (
                <p className="text-xs sm:text-sm text-gray-400 text-center py-3 sm:py-4">No classes</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingEntry ? 'Edit Entry' : 'Add Entry'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 active:text-gray-700 p-1">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="class">Class</option>
                    <option value="exam">Exam</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Day</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  >
                    {DAYS.map((day, idx) => (
                      <option key={idx} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base font-medium
                    text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg text-sm sm:text-base font-medium
                    hover:bg-primary-700 active:bg-primary-800 transition-colors"
                >
                  {editingEntry ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timetable;
