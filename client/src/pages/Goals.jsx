import { useState, useEffect } from 'react';
import { goalAPI } from '../utils/api';
import { Plus, Trash2, X, Target } from 'lucide-react';
import toast from 'react-hot-toast';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetGrade: '',
    course: '',
    targetDate: '',
    progress: 0
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await goalAPI.getAll();
      setGoals(data);
    } catch (error) {
      toast.error('Failed to load goals');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await goalAPI.create(formData);
      toast.success('Goal created!');
      setShowModal(false);
      resetForm();
      fetchGoals();
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const updateProgress = async (id, progress) => {
    try {
      await goalAPI.update(id, { progress });
      toast.success('Progress updated!');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await goalAPI.delete(id);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      targetGrade: '',
      course: '',
      targetDate: '',
      progress: 0
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Goals</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-2 sm:px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700
            active:bg-primary-800 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add Goal</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {goals.length === 0 ? (
          <div className="col-span-2 text-center py-8 sm:py-12">
            <Target className="mx-auto text-gray-400 mb-3 sm:mb-4" size={40} />
            <p className="text-sm sm:text-base text-gray-500">No goals yet. Create one to get started!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal._id}
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{goal.title}</h3>
                  {goal.course && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{goal.course}</p>
                  )}
                  {goal.targetGrade && (
                    <p className="text-xs sm:text-sm text-primary-600 mt-1">Target: {goal.targetGrade}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteGoal(goal._id)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 active:text-red-700 transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{goal.progress}%</span>
                </div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 
                      transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Progress Slider */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) => updateProgress(goal._id, parseInt(e.target.value))}
                  className="w-full accent-primary-600 cursor-pointer"
                />
              </div>

              {goal.targetDate && (
                <p className="text-xs text-gray-500 mt-2 sm:mt-3">
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New Goal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 active:text-gray-700 p-1">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Goal Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Get A- in Data Structures"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Course</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Data Structures"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Target Grade</label>
                <input
                  type="text"
                  value={formData.targetGrade}
                  onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="A-"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg font-medium
                    text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg font-medium
                    hover:bg-primary-700 active:bg-primary-800 transition-colors"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
