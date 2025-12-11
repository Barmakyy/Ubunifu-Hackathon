import { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { User as UserIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';

function Profile() {
  const { user, setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    course: '',
    year: '',
    semesterGoals: ['', '', ''],
    studyPreference: 'flexible',
    motivationStyle: 'friendly'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getProfile();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        institution: data.institution || '',
        course: data.course || '',
        year: data.year || '',
        semesterGoals: data.semesterGoals || ['', '', ''],
        studyPreference: data.studyPreference || 'flexible',
        motivationStyle: data.motivationStyle || 'friendly'
      });
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleGoalChange = (index, value) => {
    const newGoals = [...formData.semesterGoals];
    newGoals[index] = value;
    setFormData({ ...formData, semesterGoals: newGoals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedData = {
        ...formData,
        semesterGoals: formData.semesterGoals.filter(g => g.trim() !== '')
      };
      
      const { data } = await userAPI.updateProfile(cleanedData);
      setAuth(data.user, useAuthStore.getState().token);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center">
              <UserIcon className="text-primary-600" size={32} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-sm sm:text-base text-primary-100">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Academic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Course</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Semester Goals (Max 3)</h3>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="text"
                value={formData.semesterGoals[i] || ''}
                onChange={(e) => handleGoalChange(i, e.target.value)}
                placeholder={`Goal ${i + 1}`}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-primary-500 focus:border-transparent outline-none mb-2 text-sm"
              />
            ))}
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Preferences</h3>
            
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Study Preference
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['morning', 'night', 'weekend', 'flexible'].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFormData({ ...formData, studyPreference: pref })}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg border-2 capitalize text-sm sm:text-base font-medium transition-all ${
                      formData.studyPreference === pref
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Motivation Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'friendly', emoji: '😊', label: 'Friendly' },
                  { value: 'strict', emoji: '💪', label: 'Strict' },
                  { value: 'chill', emoji: '😎', label: 'Chill' },
                  { value: 'hype', emoji: '🔥', label: 'Hype' }
                ].map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, motivationStyle: style.value })}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg border-2 text-sm sm:text-base font-medium transition-all ${
                      formData.motivationStyle === style.value
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl mr-1.5 sm:mr-2">{style.emoji}</span>
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
            >
              <Save size={18} className="sm:w-5 sm:h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
