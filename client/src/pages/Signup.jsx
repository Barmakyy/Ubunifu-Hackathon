import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Sparkles, GraduationCap, Heart } from 'lucide-react';
import axios from 'axios';

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
      // Create new user object matching db.json structure
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      
      const newUser = {
        id: 's' + Date.now(), // Generate unique ID
        role: 'student',
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        password: formData.password,
        institutionId: 'inst1', // Default institution
        department: formData.course,
        year: formData.year,
        phone: formData.phone || '',
        selectedUnits: [],
        classIds: [],
        goals: formData.semesterGoals.filter(g => g.trim() !== ''),
        motivationalTone: formData.motivationStyle,
        motivationPersona: formData.motivationPersona,
        studyPreference: formData.studyPreference,
        streak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        graceUnitsRemaining: 2,
        graceUnitsTotal: 2,
        totalClasses: 0,
        attendedClasses: 0
      };

      // Save to db.json
      const response = await axios.post('http://localhost:8000/users', newUser);
      
      // Set auth with new user
      setAuth(response.data, 'token-' + response.data.id);
      toast.success('Account created successfully! Welcome aboard! 🎉');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-400 via-violet-400 to-coral-400 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sage-400 to-violet-400 rounded-2xl mb-4 shadow-lg">
            {step === 1 && <Sparkles className="w-8 h-8 text-white" />}
            {step === 2 && <GraduationCap className="w-8 h-8 text-white" />}
            {step === 3 && <Heart className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sage-600 via-violet-600 to-coral-600 bg-clip-text text-transparent mb-2">
            Join Us!
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {step === 1 && "Let's get to know you"}
            {step === 2 && "Tell us about your studies"}
            {step === 3 && "Personalize your experience"}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  step >= num
                    ? 'bg-gradient-to-br from-sage-500 to-violet-500 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className={`w-12 md:w-20 h-1.5 mx-2 rounded-full transition-all duration-300 ${
                    step > num ? 'bg-gradient-to-r from-sage-500 to-violet-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-sage-400 focus:border-sage-400 outline-none transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-sage-400 focus:border-sage-400 outline-none transition-all"
                  placeholder="your.email@university.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-sage-400 focus:border-sage-400 outline-none transition-all"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-sage-400 focus:border-sage-400 outline-none transition-all"
                  placeholder="At least 6 characters"
                />
                <p className="mt-1.5 text-xs text-gray-500">Choose a strong password to keep your account secure</p>
              </div>
            </div>
          )}

          {/* Step 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Academic Details</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Institution</label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-violet-400 focus:border-violet-400 outline-none transition-all"
                  placeholder="University of Example"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-violet-400 focus:border-violet-400 outline-none transition-all"
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                <select
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-violet-400 focus:border-violet-400 outline-none transition-all bg-white"
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Semester Goals (Optional - Max 3)
                </label>
                <p className="text-xs text-gray-500 mb-3">What do you want to achieve this semester?</p>
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    type="text"
                    value={formData.semesterGoals[i]}
                    onChange={(e) => handleGoalChange(i, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 
                      focus:ring-violet-400 focus:border-violet-400 outline-none mb-2.5 transition-all"
                    placeholder={`Goal ${i + 1} (e.g., Maintain 85% attendance)`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Your Preferences</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  When do you study best?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['morning', 'night', 'weekend', 'flexible'].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData({ ...formData, studyPreference: pref })}
                      className={`px-4 py-3.5 rounded-xl border-2 capitalize font-semibold transition-all ${
                        formData.studyPreference === pref
                          ? 'border-coral-500 bg-coral-50 text-coral-700 shadow-md scale-105'
                          : 'border-gray-200 hover:border-coral-300 text-gray-600'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What is your student type?
                </label>
                <p className="text-xs text-gray-500 mb-3">This helps us personalize your experience</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all text-left ${
                        formData.motivationPersona === persona.value
                          ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-md scale-105'
                          : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{persona.emoji}</span>
                        <span className="font-bold text-base">{persona.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{persona.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                      className={`px-4 py-3.5 rounded-xl border-2 font-semibold transition-all ${
                        formData.motivationStyle === style.value
                          ? 'border-sage-500 bg-sage-50 text-sage-700 shadow-md scale-105'
                          : 'border-gray-200 hover:border-sage-300 text-gray-600'
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
          <div className="flex gap-3 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl font-semibold
                  text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-sage-500 to-violet-500 text-white 
                  rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-coral-500 text-white 
                  rounded-xl font-bold hover:shadow-lg hover:scale-105 disabled:opacity-50 
                  disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
              >
                {loading ? 'Creating Account...' : 'Complete Signup ✨'}
              </button>
            )}
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-sage-600 font-bold hover:text-sage-700 underline decoration-2">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
