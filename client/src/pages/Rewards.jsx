import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Trophy, Gift, Star, Award, Lock } from 'lucide-react';

const rewards = [
  { milestone: 10, reward: 'Library Priority Access', icon: Star, description: 'Skip the queue and get priority access to library resources', color: 'sage' },
  { milestone: 20, reward: 'Digital Badge', icon: Award, description: 'Show off your commitment with an exclusive digital badge', color: 'violet' },
  { milestone: 40, reward: 'Hostel Room Priority', icon: Gift, description: 'Get priority selection for hostel room upgrades', color: 'dusty' },
  { milestone: 60, reward: 'Certificate of Excellence', icon: Trophy, description: 'Official recognition certificate from the institution', color: 'coral' }
];

export default function Rewards() {
  const { user } = useAuthStore();
  const currentStreak = user?.streak || 0;

  const getColorClasses = (color, unlocked) => {
    const colors = {
      sage: unlocked ? 'bg-sage-500 text-white' : 'bg-sage-100 text-sage-400',
      violet: unlocked ? 'bg-violet-500 text-white' : 'bg-violet-100 text-violet-400',
      dusty: unlocked ? 'bg-dusty-500 text-white' : 'bg-dusty-100 text-dusty-400',
      coral: unlocked ? 'bg-coral-500 text-white' : 'bg-coral-100 text-coral-400'
    };
    return colors[color];
  };

  const getBorderColor = (color, unlocked) => {
    const borders = {
      sage: unlocked ? 'border-sage-500' : 'border-sage-200',
      violet: unlocked ? 'border-violet-500' : 'border-violet-200',
      dusty: unlocked ? 'border-dusty-500' : 'border-dusty-200',
      coral: unlocked ? 'border-coral-500' : 'border-coral-200'
    };
    return borders[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-violet-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sage-800 mb-3">Your Rewards Journey</h1>
          <p className="text-sage-600 text-lg">Every streak brings you closer to something real</p>
        </div>

        {/* Current Streak Display */}
        <div className="bg-white rounded-[1.5rem] shadow-xl p-8 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 mb-4 animate-pulse-ring">
            <div className="text-white">
              <div className="text-5xl font-bold">{currentStreak}</div>
              <div className="text-sm uppercase tracking-wide">Day Streak</div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-sage-800 mb-2">Your streak is your story, not your stress</h2>
          <p className="text-sage-600">Keep showing up. The rewards are waiting.</p>
        </div>

        {/* Rewards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {rewards.map((reward, index) => {
            const unlocked = currentStreak >= reward.milestone;
            const Icon = reward.icon;
            const progress = Math.min((currentStreak / reward.milestone) * 100, 100);

            return (
              <div
                key={index}
                className={`bg-white rounded-[1.5rem] shadow-lg overflow-hidden border-4 transition-all ${
                  getBorderColor(reward.color, unlocked)
                } ${unlocked ? 'scale-105' : 'opacity-80'}`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      getColorClasses(reward.color, unlocked)
                    } transition-all`}>
                      {unlocked ? (
                        <Icon className="w-8 h-8" />
                      ) : (
                        <Lock className="w-8 h-8" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-sage-800">{reward.reward}</h3>
                        {unlocked && (
                          <span className="px-2 py-1 bg-sage-100 text-sage-700 text-xs font-semibold rounded-full">
                            Unlocked!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-sage-600">{reward.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-sage-600">
                        {unlocked ? 'Completed!' : `${currentStreak} / ${reward.milestone} classes`}
                      </span>
                      <span className="font-semibold text-sage-700">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-sage-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          unlocked ? 'bg-sage-500' : 'bg-sage-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {unlocked && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-sage-50 to-cream-50 rounded-xl">
                      <p className="text-sm text-sage-700 font-medium">
                        🎉 You did it! Contact the admin office to claim your reward.
                      </p>
                    </div>
                  )}

                  {!unlocked && currentStreak > 0 && (
                    <div className="mt-4 p-3 bg-cream-50 rounded-xl border-2 border-cream-200">
                      <p className="text-sm text-sage-700">
                        <span className="font-semibold">
                          {reward.milestone - currentStreak} more {reward.milestone - currentStreak === 1 ? 'class' : 'classes'}
                        </span>{' '}
                        to unlock!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement Section */}
        <div className="mt-8 bg-gradient-to-r from-violet-100 via-dusty-100 to-sage-100 rounded-[1.5rem] p-8 text-center border-4 border-white shadow-lg">
          <h3 className="text-2xl font-bold text-sage-800 mb-3">Remember</h3>
          <p className="text-sage-700 text-lg max-w-2xl mx-auto">
            These rewards aren't just prizes—they're proof of your commitment. Every class you attend, 
            every day you show up, you're building habits that will carry you forward. 
            <span className="font-semibold"> Keep going. We believe in you.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
