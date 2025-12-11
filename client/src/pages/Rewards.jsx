import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { Trophy, Gift, Star, Award, Lock, Flame } from 'lucide-react';

export default function Rewards() {
  const { user } = useAuthStore();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentStreak = user?.streak || 0;

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await axios.get('http://localhost:8000/institutions');
      const institution = res.data.find(inst => inst.id === user?.institutionId);
      if (institution?.rewards) {
        const rewardsWithIcons = institution.rewards.map((r, i) => ({
          ...r,
          icon: [Star, Award, Gift, Trophy][i % 4]
        }));
        setRewards(rewardsWithIcons);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <p className="text-sm sm:text-base text-gray-600">Loading rewards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Attendance Rewards</h1>
          <p className="text-sm sm:text-base text-gray-600">Unlock rewards by maintaining your attendance streak</p>
        </div>

        {/* Current Streak Display */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-200">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-orange-50 border-2 sm:border-4 border-orange-200 flex items-center justify-center">
              <Flame className="text-orange-600" size={32} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">{currentStreak} <span className="text-base sm:text-xl text-gray-600">days</span></p>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {rewards.map((reward, index) => {
            const unlocked = currentStreak >= reward.milestone;
            const Icon = reward.icon;
            const progress = Math.min((currentStreak / reward.milestone) * 100, 100);

            return (
              <div
                key={index}
                className={`bg-white rounded-lg sm:rounded-xl shadow-sm border overflow-hidden transition-all ${
                  unlocked ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    } transition-all`}>
                      {unlocked ? (
                        <Icon size={24} className="sm:w-8 sm:h-8" />
                      ) : (
                        <Lock size={24} className="sm:w-8 sm:h-8" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{reward.reward}</h3>
                        {unlocked && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">{reward.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">
                        {unlocked ? 'Completed!' : `${currentStreak} / ${reward.milestone} days`}
                      </span>
                      <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          unlocked ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {unlocked && (
                    <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs sm:text-sm text-green-800 font-medium">
                        ✓ Unlocked! Contact admin office to claim your reward.
                      </p>
                    </div>
                  )}

                  {!unlocked && currentStreak > 0 && (
                    <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <span className="font-semibold">
                          {reward.milestone - currentStreak} more {reward.milestone - currentStreak === 1 ? 'day' : 'days'}
                        </span>{' '}
                        to unlock
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement Section */}
        <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
          <p className="text-sm sm:text-base text-gray-800 text-center">
            Keep up your attendance streak to unlock more rewards. Every day counts!
          </p>
        </div>
      </div>
    </div>
  );
}
