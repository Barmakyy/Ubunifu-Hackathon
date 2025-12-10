import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

function Signup() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    institution: '',
    course: '',
    year: '',
    semesterGoals: ['', '', ''],
    studyPreference: 'flexible',
    motivationStyle: 'friendly',
    motivationPersona: 'hustler'
  });
  const [loading, setLoading] = useState(false);

  const handleGoalChange = (index, value) => {
    const newGoals = [...formData.semesterGoals];
    newGoals[index] = value;
    setFormData({ ...formData, semesterGoals: newGoals });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.institution || !formData.course || !formData.year) {
        toast.error('Please fill in all academic details');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedData = {
        ...formData,
        semesterGoals: formData.semesterGoals.filter(g => g.trim() !== '')
      };
      
      const { data } = await authAPI.signup(cleanedData);
      setAuth(data.user, data.token);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join StudySync</h1>
          <p className="text-gray-600">Let's set up your personalized learning journey</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* Step 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="University of Example"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester Goals (Max 3)
                </label>
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    type="text"
                    value={formData.semesterGoals[i]}
                    onChange={(e) => handleGoalChange(i, e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-primary-500 focus:border-transparent outline-none mb-2"
                    placeholder={`Goal ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Preferences</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When do you study best?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['morning', 'night', 'weekend', 'flexible'].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData({ ...formData, studyPreference: pref })}
                      className={`px-4 py-3 rounded-lg border-2 capitalize font-medium transition-all ${
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your student type?
                </label>
                <p className="text-xs text-gray-500 mb-3">This helps us personalize your experience</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'hustler', emoji: '🚀', label: 'Hustler', desc: 'Fast wins, competitive' },
                    { value: 'anxious', emoji: '🎯', label: 'Planner', desc: 'Needs reassurance, steps' },
                    { value: 'busy', emoji: '⚡', label: 'Busy', desc: 'Flexible, efficient' },
                    { value: 'skeptic', emoji: '🤔', label: 'Skeptic', desc: 'Privacy-first, minimal' }
                  ].map((persona) => (
                    <button
                      key={persona.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, motivationPersona: persona.value })}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all text-left ${
                        formData.motivationPersona === persona.value
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{persona.emoji}</span>
                        <span className="font-semibold">{persona.label}</span>
                      </div>
                      <p className="text-xs opacity-70">{persona.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How should we motivate you?
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        formData.motivationStyle === style.value
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mr-2">{style.emoji}</span>
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium
                  text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium
                  hover:bg-primary-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium
                  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors"
              >
                {loading ? 'Creating Account...' : 'Complete Signup'}
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
