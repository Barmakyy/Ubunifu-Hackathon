import { useState, useEffect } from 'react';
import { 
  Award, Plus, Edit2, Trash2, Save, X, Users, 
  TrendingUp, Gift, Star, Trophy, Search
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReward, setEditingReward] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    milestone: '',
    reward: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchTerm, students]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [institutionsRes, usersRes] = await Promise.all([
        api.get('/institutions'),
        api.get('/users')
      ]);

      // Get rewards from first institution
      const institution = institutionsRes.data[0];
      if (institution?.rewards) {
        setRewards(institution.rewards);
      }

      // Get students with their streaks
      const studentsData = usersRes.data.filter(u => u.role === 'student');
      const studentsWithProgress = studentsData.map(student => {
        const streak = student.streak || 0;
        const unlockedRewards = institution?.rewards?.filter(r => streak >= r.milestone).length || 0;
        const nextReward = institution?.rewards?.find(r => streak < r.milestone);
        
        return {
          ...student,
          streak,
          unlockedRewards,
          nextReward,
          totalRewards: institution?.rewards?.length || 0
        };
      });

      setStudents(studentsWithProgress);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredStudents(filtered);
  };

  const handleAddReward = async () => {
    if (!formData.milestone || !formData.reward || !formData.description) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const institutionsRes = await api.get('/institutions');
      const institution = institutionsRes.data[0];
      
      const newRewards = [
        ...(institution.rewards || []),
        {
          milestone: parseInt(formData.milestone),
          reward: formData.reward,
          description: formData.description
        }
      ].sort((a, b) => a.milestone - b.milestone);

      await api.patch(`/institutions/${institution.id}`, {
        rewards: newRewards
      });

      setRewards(newRewards);
      setFormData({ milestone: '', reward: '', description: '' });
      setShowAddForm(false);
      toast.success('Reward added successfully');
      fetchData();
    } catch (error) {
      console.error('Error adding reward:', error);
      toast.error('Failed to add reward');
    }
  };

  const handleEditReward = async (index) => {
    if (!formData.milestone || !formData.reward || !formData.description) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const institutionsRes = await api.get('/institutions');
      const institution = institutionsRes.data[0];
      
      const updatedRewards = [...rewards];
      updatedRewards[index] = {
        milestone: parseInt(formData.milestone),
        reward: formData.reward,
        description: formData.description
      };
      updatedRewards.sort((a, b) => a.milestone - b.milestone);

      await api.patch(`/institutions/${institution.id}`, {
        rewards: updatedRewards
      });

      setRewards(updatedRewards);
      setEditingReward(null);
      setFormData({ milestone: '', reward: '', description: '' });
      toast.success('Reward updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating reward:', error);
      toast.error('Failed to update reward');
    }
  };

  const handleDeleteReward = async (index) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const institutionsRes = await api.get('/institutions');
      const institution = institutionsRes.data[0];
      
      const updatedRewards = rewards.filter((_, i) => i !== index);

      await api.patch(`/institutions/${institution.id}`, {
        rewards: updatedRewards
      });

      setRewards(updatedRewards);
      toast.success('Reward deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  const startEdit = (reward, index) => {
    setEditingReward(index);
    setFormData({
      milestone: reward.milestone,
      reward: reward.reward,
      description: reward.description
    });
  };

  const cancelEdit = () => {
    setEditingReward(null);
    setFormData({ milestone: '', reward: '', description: '' });
  };

  const iconOptions = [Star, Award, Gift, Trophy];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalRewards: rewards.length,
    totalStudents: students.length,
    studentsWithRewards: students.filter(s => s.unlockedRewards > 0).length,
    averageStreak: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.streak, 0) / students.length)
      : 0
  };

  return (
    <div className="p-0 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
          Rewards Management
        </h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Configure attendance rewards and track student progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Total Rewards</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.totalRewards}</p>
            </div>
            <Gift className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Students with Rewards</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.studentsWithRewards}</p>
            </div>
            <Users className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Total Students</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
            </div>
            <Users className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Avg Streak</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.averageStreak}</p>
            </div>
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Rewards Configuration */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Reward Milestones</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-xs sm:text-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Add Reward
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Add New Reward</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Milestone (days)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 30"
                    className="w-full px-2 sm:px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                    value={formData.milestone}
                    onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Reward Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Library Pass"
                    className="w-full px-2 sm:px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Priority access to library"
                    className="w-full px-2 sm:px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddReward}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-xs sm:text-sm"
                >
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ milestone: '', reward: '', description: '' });
                  }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors text-xs sm:text-sm"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Rewards List */}
          <div className="space-y-4">
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No rewards configured. Click "Add Reward" to create one.
              </div>
            ) : (
              rewards.map((reward, index) => {
                const Icon = iconOptions[index % iconOptions.length];
                const isEditing = editingReward === index;

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    {isEditing ? (
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Milestone (days)
                            </label>
                            <input
                              type="number"
                              className="w-full px-2 sm:px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                              value={formData.milestone}
                              onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Reward Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-2 sm:px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                              value={formData.reward}
                              onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              className="w-full px-2 sm:px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReward(index)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 active:bg-green-800"
                          >
                            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-300 active:bg-gray-400"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                {reward.milestone} days
                              </span>
                              <h3 className="font-semibold text-gray-900">{reward.reward}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(reward, index)}
                            className="p-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReward(index)}
                            className="p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Student Progress */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Student Progress</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-10 pr-2 sm:pr-4 py-2 border rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Current Streak</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Unlocked Rewards</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Next Reward</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 sm:px-4 lg:px-6 py-8 text-center text-gray-500 text-xs sm:text-sm">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const progress = student.nextReward 
                    ? Math.min((student.streak / student.nextReward.milestone) * 100, 100)
                    : 100;

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">{student.email}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 text-xs sm:text-sm font-semibold rounded-full">
                          🔥 {student.streak} days
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {student.unlockedRewards} / {student.totalRewards}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                        {student.nextReward ? (
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {student.nextReward.reward}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500">
                              {student.nextReward.milestone - student.streak} more days
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-green-600 font-medium">All unlocked! 🎉</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                            <div 
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600">{Math.round(progress)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRewards;
