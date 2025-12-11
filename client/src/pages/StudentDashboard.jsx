import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Flame, QrCode, Gift, MessageCircle, TrendingUp, Battery, BatteryMedium, BatteryFull, BookOpen, Award, Users, Play, Target, Brain, Zap, Video, Sparkles, Trophy, Star } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New state for behavioral features
  const [energyLevel, setEnergyLevel] = useState(null);
  const [studyStreak, setStudyStreak] = useState({ current: 7, longest: 12, skipUsed: false });
  const [weeklyProgress, setWeeklyProgress] = useState({ completed: 2.5, goal: 4, percentage: 63 });
  const [studyBuddy, setStudyBuddy] = useState({ name: 'Sarah K.', lastActive: '45 min ago', online: true });
  const [badges, setBadges] = useState([
    { id: 1, name: 'Consistent Learner', icon: '🔥', earnedToday: true },
    { id: 2, name: 'Question Asker', icon: '❓', earnedToday: false },
    { id: 3, name: 'Early Bird', icon: '🌅', earnedToday: false }
  ]);
  const [weekComparison, setWeekComparison] = useState({
    studyTime: { current: 3.5, change: 20, direction: 'up' },
    concepts: { current: 8, change: 3, direction: 'up' },
    questions: { current: 5, change: 2, direction: 'down' }
  });
  const [spacedRepetition, setSpacedRepetition] = useState([
    { id: 1, topic: 'Calculus - Derivatives', minutesNeeded: 5, completed: false },
    { id: 2, topic: 'Data Structures - Trees', minutesNeeded: 5, completed: true },
    { id: 3, topic: 'Physics - Newton\'s Laws', minutesNeeded: 5, completed: false }
  ]);
  const [topicMastery, setTopicMastery] = useState([
    { subject: 'Calculus', completed: 12, total: 20, percentage: 60 },
    { subject: 'Programming', completed: 18, total: 25, percentage: 72 },
    { subject: 'Physics', completed: 8, total: 15, percentage: 53 }
  ]);
  const [upcomingExams, setUpcomingExams] = useState([
    { id: 1, subject: 'Calculus', date: 'Dec 20', topics: [
      { name: 'Derivatives', confidence: 7 },
      { name: 'Integrals', confidence: 4 },
      { name: 'Limits', confidence: 8 }
    ]},
    { id: 2, subject: 'Programming', date: 'Dec 22', topics: [
      { name: 'Algorithms', confidence: 6 },
      { name: 'Data Structures', confidence: 5 }
    ]}
  ]);
  const [studyTimer, setStudyTimer] = useState({ active: false, minutes: 15, elapsed: 0 });
  
  // NEW ENGAGEMENT FEATURES
  // Daily Study Missions
  const [dailyMissions, setDailyMissions] = useState([
    { id: 1, title: 'Study for 15 minutes', difficulty: 'Easy', xp: 10, completed: false, progress: 0, target: 15 },
    { id: 2, title: 'Review 1 spaced repetition topic', difficulty: 'Medium', xp: 20, completed: false, progress: 0, target: 1 },
    { id: 3, title: 'Join a study room with a buddy', difficulty: 'Hard', xp: 30, completed: false, progress: 0, target: 1 }
  ]);
  
  // Study Buddy Live Rooms
  const [liveRooms, setLiveRooms] = useState([
    { id: 1, name: 'Calculus Grind 📐', host: 'Sarah K.', participants: 3, maxParticipants: 6, subject: 'Math', joined: false },
    { id: 2, name: 'Programming Marathon 💻', host: 'Mike T.', participants: 5, maxParticipants: 6, subject: 'CS', joined: false },
    { id: 3, name: 'Physics Study Session ⚡', host: 'Emma L.', participants: 2, maxParticipants: 4, subject: 'Physics', joined: false }
  ]);
  const [showLiveRooms, setShowLiveRooms] = useState(false);
  
  // Loot Box System
  const [lootBoxes, setLootBoxes] = useState(2); // Available loot boxes
  const [showLootBox, setShowLootBox] = useState(false);
  const [lootBoxReward, setLootBoxReward] = useState(null);
  const [isOpeningLootBox, setIsOpeningLootBox] = useState(false);
  
  // Weekly Report Data
  const [weeklyReport, setWeeklyReport] = useState({
    weekNumber: 'Week of Dec 4-10',
    totalStudyHours: 12.5,
    classesAttended: 14,
    totalClasses: 15,
    attendanceRate: 93,
    studySessionsCompleted: 18,
    topicsReviewed: 24,
    questionsAsked: 12,
    liveRoomsJoined: 6,
    badgesEarned: 3,
    totalXP: 450,
    dailyAverage: {
      studyTime: 1.8,
      sessions: 2.6
    },
    subjectBreakdown: [
      { subject: 'Mathematics', hours: 4.5, percentage: 36 },
      { subject: 'Programming', hours: 5.0, percentage: 40 },
      { subject: 'Physics', hours: 3.0, percentage: 24 }
    ],
    achievements: [
      { icon: '🔥', title: '7-Day Streak Maintained', date: 'Dec 10' },
      { icon: '🏆', title: 'Study Champion Badge', date: 'Dec 8' },
      { icon: '📚', title: 'Completed 20 Reviews', date: 'Dec 6' }
    ],
    improvement: '+15% from last week'
  });
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      // Mock data - replace with actual API call
      const schedule = [
        { id: 1, unit: 'Programming 101', time: '08:00 - 09:00', room: 'Lab 1', attended: true },
        { id: 2, unit: 'Discrete Mathematics', time: '09:15 - 10:15', room: 'Room 203', attended: false },
        { id: 3, unit: 'Computer Systems', time: '10:30 - 11:30', room: 'Lab 2', attended: false }
      ];
      setTodaySchedule(schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.firstName || 'there';
    const tones = {
      encouraging: ['You have got this', 'Ready to shine', 'Make it great'],
      gentle: ['Take it one step at a time', 'You are doing well', 'Breathe and begin'],
      motivating: ['Time to crush it', 'Go for it', 'Make today count'],
      supportive: ['We are here for you', 'You are not alone', 'One day at a time'],
      calm: ['Peace and focus', 'Steady as you go', 'Find your center']
    };
    
    const tone = user?.motivationalTone || 'encouraging';
    const message = tones[tone][Math.floor(Math.random() * tones[tone].length)];
    
    if (hour < 12) return `Good morning, ${name}! ☀️ ${message}.`;
    if (hour < 18) return `Good afternoon, ${name}! 🌤️ ${message}.`;
    return `Good evening, ${name}! 🌙 ${message}.`;
  };

  const streakPercentage = ((user?.streak || 0) / 60) * 100;
  const attendanceRate = ((user?.attendedClasses || 0) / (user?.totalClasses || 1)) * 100;

  const startStudySession = () => {
    setStudyTimer({ ...studyTimer, active: true });
    toast.success('15-minute study session started! 🎯');
    
    // Update mission progress
    setDailyMissions(prev => 
      prev.map(mission => 
        mission.id === 1 ? { ...mission, progress: 15, completed: true } : mission
      )
    );
    
    // Earn a loot box after session
    setTimeout(() => {
      setLootBoxes(prev => prev + 1);
      toast.success('🎁 You earned a Loot Box!', { duration: 3000 });
    }, 2000);
  };

  const stopStudySession = () => {
    setStudyTimer({ active: false, minutes: 15, elapsed: 0 });
    toast.success('Great work! Session completed 🎉');
  };

  const handleEnergySelection = (level) => {
    setEnergyLevel(level);
    const suggestions = {
      tired: 'Try a quick 10-minute session instead of 30.',
      neutral: 'A solid 15-20 minute session would be perfect!',
      energized: 'You\'re ready! Challenge yourself with 30 minutes of deep work.'
    };
    toast.success(suggestions[level]);
  };

  const markReviewComplete = (id) => {
    setSpacedRepetition(prev => 
      prev.map(item => item.id === id ? { ...item, completed: true } : item)
    );
    
    // Update mission progress
    setDailyMissions(prev => 
      prev.map(mission => 
        mission.id === 2 ? { ...mission, progress: mission.progress + 1, completed: mission.progress + 1 >= mission.target } : mission
      )
    );
    
    toast.success('Review completed! 🎯');
  };
  
  // NEW ENGAGEMENT FUNCTIONS
  const completeMission = (missionId) => {
    const mission = dailyMissions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
      setDailyMissions(prev => 
        prev.map(m => m.id === missionId ? { ...m, completed: true, progress: m.target } : m)
      );
      toast.success(`Mission completed! +${mission.xp} XP 🎯`);
      
      // Check if all missions complete
      const allComplete = dailyMissions.every(m => m.id === missionId ? true : m.completed);
      if (allComplete) {
        setTimeout(() => {
          toast.success('🎉 All daily missions complete! DOUBLE XP EARNED!', { duration: 4000 });
          setLootBoxes(prev => prev + 2);
        }, 500);
      }
    }
  };
  
  const joinLiveRoom = (roomId) => {
    setLiveRooms(prev => 
      prev.map(room => 
        room.id === roomId 
          ? { ...room, participants: room.participants + 1, joined: true }
          : room
      )
    );
    
    // Update mission progress
    setDailyMissions(prev => 
      prev.map(mission => 
        mission.id === 3 ? { ...mission, progress: 1, completed: true } : mission
      )
    );
    
    toast.success('Joined study room! Good luck! 🚀');
  };
  
  const leaveLiveRoom = (roomId) => {
    setLiveRooms(prev => 
      prev.map(room => 
        room.id === roomId 
          ? { ...room, participants: room.participants - 1, joined: false }
          : room
      )
    );
    toast.success('Left study room');
  };
  
  const openLootBox = () => {
    if (lootBoxes <= 0) {
      toast.error('No loot boxes available! Complete a study session to earn one.');
      return;
    }
    
    setIsOpeningLootBox(true);
    setShowLootBox(true);
    
    // Simulate opening animation
    setTimeout(() => {
      const random = Math.random();
      let reward;
      
      if (random < 0.02) {
        // 2% - Physical reward
        reward = {
          type: 'legendary',
          icon: '🎟️',
          title: 'LEGENDARY REWARD!',
          description: 'Free Lunch Voucher - Ksh 500',
          xp: 100
        };
      } else if (random < 0.10) {
        // 8% - Rare badge
        reward = {
          type: 'rare',
          icon: '🏆',
          title: 'Rare Badge Earned!',
          description: 'Study Champion Badge',
          xp: 50
        };
      } else {
        // 90% - Common reward
        const commonRewards = [
          { icon: '💭', title: 'Motivational Quote', description: '"Every expert was once a beginner"', xp: 5 },
          { icon: '⭐', title: 'XP Boost', description: '+5 Experience Points', xp: 5 },
          { icon: '🔥', title: 'Streak Saver', description: '1 Extra Skip Day This Week', xp: 5 },
          { icon: '💪', title: 'Encouragement', description: 'You\'re doing amazing! Keep going!', xp: 5 }
        ];
        reward = { ...commonRewards[Math.floor(Math.random() * commonRewards.length)], type: 'common' };
      }
      
      setLootBoxReward(reward);
      setLootBoxes(prev => prev - 1);
      setIsOpeningLootBox(false);
      
      toast.success(`+${reward.xp} XP!`);
    }, 2000);
  };
  
  const closeLootBox = () => {
    setShowLootBox(false);
    setLootBoxReward(null);
  };

  const allMissionsComplete = dailyMissions.every(m => m.completed);
  const completedMissions = dailyMissions.filter(m => m.completed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Loot Box Modal */}
        {showLootBox && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
              {isOpeningLootBox ? (
                <div className="text-center py-8">
                  <div className="animate-bounce text-6xl mb-4">🎁</div>
                  <p className="text-xl font-bold text-gray-900">Opening Loot Box...</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              ) : lootBoxReward ? (
                <div className="text-center">
                  <div className={`text-7xl mb-4 ${lootBoxReward.type === 'legendary' ? 'animate-bounce' : ''}`}>
                    {lootBoxReward.icon}
                  </div>
                  <h3 className={`text-2xl font-black mb-2 ${
                    lootBoxReward.type === 'legendary' ? 'text-yellow-600' :
                    lootBoxReward.type === 'rare' ? 'text-purple-600' :
                    'text-blue-600'
                  }`}>
                    {lootBoxReward.title}
                  </h3>
                  <p className="text-gray-700 mb-4">{lootBoxReward.description}</p>
                  <div className="bg-blue-50 rounded-lg p-3 mb-6">
                    <p className="text-sm font-bold text-blue-700">+{lootBoxReward.xp} XP Earned!</p>
                  </div>
                  <button
                    onClick={closeLootBox}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Awesome! 🎉
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Weekly Report Modal */}
        {showWeeklyReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-2xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl my-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Trophy className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Weekly Report</h2>
                    <p className="text-sm text-gray-600">{weeklyReport.weekNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWeeklyReport(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-blue-600" size={20} />
                    <p className="text-xs text-gray-600 font-medium">Study Hours</p>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{weeklyReport.totalStudyHours}h</p>
                  <p className="text-xs text-green-600 font-bold mt-1">{weeklyReport.improvement}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-xs text-gray-600 font-medium">Attendance</p>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{weeklyReport.attendanceRate}%</p>
                  <p className="text-xs text-gray-600 mt-1">{weeklyReport.classesAttended}/{weeklyReport.totalClasses} classes</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="text-yellow-600" size={20} />
                    <p className="text-xs text-gray-600 font-medium">Total XP</p>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{weeklyReport.totalXP}</p>
                  <p className="text-xs text-gray-600 mt-1">{weeklyReport.badgesEarned} badges earned</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-purple-600" size={20} />
                    <p className="text-xs text-gray-600 font-medium">Sessions</p>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{weeklyReport.studySessionsCompleted}</p>
                  <p className="text-xs text-gray-600 mt-1">{weeklyReport.dailyAverage.sessions}/day avg</p>
                </div>
              </div>

              {/* Activity Breakdown */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Subject Time Distribution */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-600" />
                    Subject Breakdown
                  </h3>
                  <div className="space-y-3">
                    {weeklyReport.subjectBreakdown.map((subject, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-semibold text-gray-900">{subject.subject}</span>
                          <span className="text-sm font-bold text-indigo-600">{subject.hours}h</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${subject.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Achievements */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award size={20} className="text-yellow-600" />
                    This Week's Wins
                  </h3>
                  <div className="space-y-3">
                    {weeklyReport.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{achievement.title}</p>
                          <p className="text-xs text-gray-600">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Summary</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-black text-blue-700">{weeklyReport.studySessionsCompleted}</p>
                    <p className="text-xs text-gray-600 mt-1">Study Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-black text-green-700">{weeklyReport.topicsReviewed}</p>
                    <p className="text-xs text-gray-600 mt-1">Topics Reviewed</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-black text-purple-700">{weeklyReport.questionsAsked}</p>
                    <p className="text-xs text-gray-600 mt-1">Questions Asked</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-black text-orange-700">{weeklyReport.liveRoomsJoined}</p>
                    <p className="text-xs text-gray-600 mt-1">Live Rooms Joined</p>
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-xl p-6 text-center">
                <p className="text-xl font-black text-white mb-2">
                  Outstanding Progress! 🎉
                </p>
                <p className="text-white text-sm opacity-90">
                  You're {weeklyReport.improvement} better than last week. Keep up the amazing work!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowWeeklyReport(false)}
                className="w-full mt-6 py-3 bg-white hover:bg-gray-50 border-2 border-indigo-600 text-indigo-700 font-bold rounded-xl transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        )}

        {/* Live Study Rooms Modal */}
        {showLiveRooms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Video className="text-green-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Live Study Rooms</h2>
                </div>
                <button
                  onClick={() => setShowLiveRooms(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                {liveRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      room.joined
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{room.name}</h3>
                        <p className="text-sm text-gray-600">Hosted by {room.host}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {room.subject}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {room.participants}/{room.maxParticipants} studying
                        </span>
                        {room.participants >= room.maxParticipants - 1 && !room.joined && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                            Almost Full!
                          </span>
                        )}
                      </div>
                      
                      {room.joined ? (
                        <button
                          onClick={() => leaveLiveRoom(room.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all text-sm"
                        >
                          Leave Room
                        </button>
                      ) : (
                        <button
                          onClick={() => joinLiveRoom(room.id)}
                          disabled={room.participants >= room.maxParticipants}
                          className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${
                            room.participants >= room.maxParticipants
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {room.participants >= room.maxParticipants ? 'Full' : 'Join Room'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 text-center">
                  💡 <strong>Tip:</strong> Study rooms keep you accountable and make studying fun!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Greeting + Energy Check-In */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{getGreeting()}</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">How are you feeling today?</p>
          
          {/* Energy Check-In Widget */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => handleEnergySelection('tired')}
              className={`flex-1 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                energyLevel === 'tired'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Battery className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 ${energyLevel === 'tired' ? 'text-purple-600' : 'text-gray-400'}`} />
              <p className="text-xs sm:text-sm font-medium text-gray-700">😴 Tired</p>
            </button>
            <button
              onClick={() => handleEnergySelection('neutral')}
              className={`flex-1 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                energyLevel === 'neutral'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <BatteryMedium className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 ${energyLevel === 'neutral' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="text-xs sm:text-sm font-medium text-gray-700">😐 Neutral</p>
            </button>
            <button
              onClick={() => handleEnergySelection('energized')}
              className={`flex-1 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                energyLevel === 'energized'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <BatteryFull className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 ${energyLevel === 'energized' ? 'text-green-600' : 'text-gray-400'}`} />
              <p className="text-xs sm:text-sm font-medium text-gray-700">💪 Energized</p>
            </button>
          </div>
        </div>

        {/* DAILY MISSIONS + LOOT BOX (TOP PRIORITY) */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Daily Study Missions */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="text-indigo-600" size={24} />
                <h2 className="text-lg sm:text-xl font-black text-gray-900">Today's Missions</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm px-3 py-1 bg-white rounded-full font-bold text-indigo-700 shadow-sm">
                  {completedMissions}/3 Complete
                </span>
                {allMissionsComplete && (
                  <span className="text-sm px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold shadow-md animate-pulse">
                    2x XP! 🔥
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {dailyMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    mission.completed
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400'
                      : 'bg-white border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      {mission.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">{mission.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            mission.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            mission.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {mission.difficulty}
                          </span>
                          <span className="text-xs text-gray-600">+{mission.xp} XP</span>
                        </div>
                      </div>
                    </div>
                    
                    {mission.completed && (
                      <span className="text-2xl">✅</span>
                    )}
                  </div>
                  
                  {!mission.completed && mission.progress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{mission.progress}/{mission.target}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {allMissionsComplete ? (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-center">
                <p className="text-white font-black text-lg">🎉 ALL MISSIONS COMPLETE! 🎉</p>
                <p className="text-white text-sm mt-1">Come back tomorrow for new challenges!</p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
                <p className="text-xs text-gray-700 text-center">
                  💡 Complete all 3 missions to unlock <strong>DOUBLE XP</strong> and 2 bonus loot boxes!
                </p>
              </div>
            )}
          </div>

          {/* Loot Box System */}
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-2 border-yellow-300">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-yellow-600" size={24} />
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Loot Boxes</h2>
            </div>
            
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="text-8xl animate-pulse">🎁</div>
                {lootBoxes > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-lg shadow-lg">
                    {lootBoxes}
                  </div>
                )}
              </div>
              <p className="text-3xl font-black text-gray-900 mt-2">{lootBoxes}</p>
              <p className="text-sm text-gray-600">Available Boxes</p>
            </div>
            
            <button
              onClick={openLootBox}
              disabled={lootBoxes <= 0}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg ${
                lootBoxes > 0
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 transform hover:scale-105 animate-pulse'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {lootBoxes > 0 ? '✨ OPEN NOW! ✨' : '🔒 No Boxes'}
            </button>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-2 bg-white bg-opacity-60 rounded-lg">
                <span className="text-xs text-gray-700">Common (90%)</span>
                <span className="text-xs">⭐ +5 XP</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-100 bg-opacity-60 rounded-lg">
                <span className="text-xs text-gray-700">Rare (8%)</span>
                <span className="text-xs">🏆 +50 XP</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-200 bg-opacity-60 rounded-lg">
                <span className="text-xs text-gray-700 font-bold">Legendary (2%)</span>
                <span className="text-xs font-bold">🎟️ Physical Reward!</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-4 text-center">
              🎯 Earn boxes by completing study sessions!
            </p>
          </div>
        </div>

        {/* LIVE STUDY ROOMS SECTION */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Video className="text-green-600" size={24} />
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Live Study Rooms</h2>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <button
              onClick={() => setShowLiveRooms(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-md text-sm sm:text-base"
            >
              View All Rooms
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveRooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  room.joined
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 shadow-md'
                    : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-sm'
                }`}
              >
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{room.name}</h3>
                  <p className="text-xs text-gray-600">by {room.host}</p>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-700 font-medium">
                      {room.participants}/{room.maxParticipants}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                    {room.subject}
                  </span>
                </div>
                
                {room.joined ? (
                  <button
                    onClick={() => leaveLiveRoom(room.id)}
                    className="w-full py-2 bg-white border-2 border-green-600 text-green-700 font-bold rounded-lg hover:bg-green-50 transition-all text-xs"
                  >
                    ✓ Joined
                  </button>
                ) : (
                  <button
                    onClick={() => joinLiveRoom(room.id)}
                    disabled={room.participants >= room.maxParticipants}
                    className={`w-full py-2 font-bold rounded-lg transition-all text-xs ${
                      room.participants >= room.maxParticipants
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {room.participants >= room.maxParticipants ? 'Full' : 'Join Now'}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
            <p className="text-sm text-gray-700 text-center">
              🤝 <strong>{liveRooms.reduce((sum, r) => sum + r.participants, 0)} students</strong> are studying right now! Join them!
            </p>
          </div>
        </div>

        {/* Top Priority Actions Row */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Study Streak Tracker - Enhanced */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="text-orange-500" size={20} />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Study Streak</h2>
              </div>
              {!studyStreak.skipUsed && (
                <span className="text-xs px-2 py-1 bg-white rounded-full text-orange-700 font-medium">
                  1 skip left
                </span>
              )}
            </div>
            
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-lg mb-3 relative">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg">{studyStreak.current}</div>
                  <div className="text-xs text-white font-bold">DAYS</div>
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-md">
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-700">Longest: <span className="font-bold text-orange-700">{studyStreak.longest} days</span></p>
              <p className="text-xs text-gray-600 mt-1">Don't break the chain! 🔥</p>
            </div>

            <button
              onClick={startStudySession}
              disabled={studyTimer.active}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                studyTimer.active
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg'
              }`}
            >
              {studyTimer.active ? '⏱️ Session Active...' : '▶️ Start 15-Min Study'}
            </button>
          </div>

          {/* Weekly Study Plan Progress */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-blue-600" size={20} />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">This Week's Goal</h2>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{weeklyProgress.completed}h</span>
                <span className="text-sm text-gray-600">of {weeklyProgress.goal}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${weeklyProgress.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{weeklyProgress.percentage}% complete</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-700">Remaining</span>
                <span className="font-bold text-blue-700">{(weeklyProgress.goal - weeklyProgress.completed).toFixed(1)}h</span>
              </div>
              <p className="text-xs text-gray-600 text-center">
                {weeklyProgress.percentage >= 100 ? '🎉 Goal achieved!' : '💪 Keep going!'}
              </p>
            </div>
          </div>

          {/* Quick Start Study Button + Timer */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Play className="text-purple-600" size={20} />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Quick Study</h2>
            </div>
            
            {studyTimer.active ? (
              <div className="text-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-black text-white">{studyTimer.minutes}</div>
                    <div className="text-xs text-white font-bold">MINUTES</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">Stay focused! You've got this 💪</p>
                <button
                  onClick={stopStudySession}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                >
                  ⏹️ End Session
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-white border-4 border-purple-300 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-sm text-gray-700 mb-4">Ready to study? Start with 15 focused minutes!</p>
                <button
                  onClick={startStudySession}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  🚀 Start Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Spaced Repetition + Study Buddy Row */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Today's Spaced Repetition Reminders */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-indigo-600" size={20} />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Review Today</h2>
              <span className="ml-auto text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                {spacedRepetition.filter(r => !r.completed).length} left
              </span>
            </div>
            
            <div className="space-y-2">
              {spacedRepetition.map((review) => (
                <div
                  key={review.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    review.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{review.topic}</p>
                    <p className="text-xs text-gray-600">{review.minutesNeeded} min quick review</p>
                  </div>
                  {review.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <button
                      onClick={() => markReviewComplete(review.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-all"
                    >
                      Start
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Spaced repetition helps you remember longer! 🧠
            </p>
          </div>

          {/* Study Buddy Activity */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-green-600" size={20} />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Study Buddy</h2>
            </div>
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  {studyBuddy.name.charAt(0)}
                </div>
                {studyBuddy.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{studyBuddy.name}</p>
                <p className="text-xs text-gray-600">Studied {studyBuddy.lastActive}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                <MessageCircle size={16} />
                Message {studyBuddy.name.split(' ')[0]}
              </button>
              <button className="w-full py-2.5 border-2 border-green-600 text-green-700 hover:bg-green-50 font-medium rounded-lg transition-all">
                Schedule Study Session
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Studying together = better results! 🤝
            </p>
          </div>
        </div>

        {/* Main Grid - Schedule + Stats */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Topic Mastery Progress + Badges */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="text-purple-600" size={20} />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Topic Mastery</h2>
              </div>
              
              <div className="space-y-3">
                {topicMastery.map((subject, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-gray-900">{subject.subject}</span>
                      <span className="text-xs font-medium text-gray-600">{subject.completed}/{subject.total} concepts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          subject.percentage >= 70 ? 'bg-green-500' :
                          subject.percentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Master concepts one at a time! 📚
              </p>
            </div>

            {/* Recent Badges */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-4">
                <Award className="text-yellow-600" size={20} />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Badges</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg text-center transition-all ${
                      badge.earnedToday
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg scale-105'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1">{badge.icon}</div>
                    <p className={`text-[10px] sm:text-xs font-bold ${
                      badge.earnedToday ? 'text-white' : 'text-gray-700'
                    }`}>
                      {badge.name}
                    </p>
                    {badge.earnedToday && (
                      <p className="text-[8px] sm:text-[10px] text-white mt-1">NEW!</p>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-700 mt-3 text-center font-medium">
                🎉 Keep earning badges for effort, not just grades!
              </p>
            </div>
          </div>

          {/* This Week vs Last Week + Exam Confidence */}
          <div className="lg:col-span-1 space-y-4">
            {/* Week Comparison */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-600" size={20} />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">This Week vs Last</h2>
              </div>
              
              <div className="space-y-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-700">Study Time</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-blue-700">{weekComparison.studyTime.current}h</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">
                        ↑ {weekComparison.studyTime.change}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-700">Concepts Mastered</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-green-700">{weekComparison.concepts.current}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">
                        ↑ {weekComparison.concepts.change}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-700">Questions Asked</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-orange-700">{weekComparison.questions.current}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">
                        ↓ {weekComparison.questions.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                You're improving! Keep going 💪
              </p>
            </div>

            {/* Upcoming Exam Confidence */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-red-600" size={20} />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">Exam Confidence</h2>
              </div>
              
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-900">{exam.subject}</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">{exam.date}</span>
                  </div>
                  <div className="space-y-2">
                    {exam.topics.map((topic, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-700">{topic.name}</span>
                          <span className="text-xs font-bold text-gray-900">{topic.confidence}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              topic.confidence >= 7 ? 'bg-green-500' :
                              topic.confidence >= 5 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${topic.confidence * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Focus on low-confidence topics! 🎯
              </p>
            </div>
          </div>
        </div>

        {/* Today's Schedule - Moved Lower */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={18} />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Today's Classes</h2>
            </div>
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm sm:text-base text-gray-600">No classes scheduled for today</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Enjoy your free time!</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {todaySchedule.map((classItem) => (
                <div
                  key={classItem.id}
                  className={`p-3 sm:p-4 rounded-lg border ${
                    classItem.attended
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">{classItem.unit}</h3>
                        {classItem.attended && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-green-500 text-white text-[10px] sm:text-xs font-medium rounded flex items-center gap-1">
                            <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                            Attended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                          {classItem.time}
                        </span>
                        <span>{classItem.room}</span>
                      </div>
                    </div>
                    
                    {!classItem.attended && (
                      <button
                        onClick={() => navigate('/scan')}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-1.5 sm:gap-2"
                      >
                        <QrCode size={14} className="sm:w-4 sm:h-4" />
                        Scan QR
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1">Total Classes</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{user?.totalClasses || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={18} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1">Attended</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{user?.attendedClasses || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={18} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{Math.round(attendanceRate)}%</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={18} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1">Grace Units</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{user?.graceUnitsRemaining || 0}/{user?.graceUnitsTotal || 2}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          <button
            onClick={() => navigate('/scan')}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-md active:shadow-sm transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <QrCode className="text-blue-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Scan QR</span>
          </button>

          <button
            onClick={() => navigate('/rewards')}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-md active:shadow-sm transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Gift className="text-green-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Rewards</span>
          </button>

          <button
            onClick={() => setShowWeeklyReport(true)}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border-2 border-indigo-200 hover:shadow-lg active:shadow-md transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <Trophy className="text-indigo-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-indigo-900">Weekly Report</span>
          </button>

          <button
            onClick={() => navigate('/chatbot')}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-md active:shadow-sm transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <MessageCircle className="text-purple-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Chat</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-md active:shadow-sm transition-all flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Reports</span>
          </button>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center border-2 border-blue-200">
          <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">
            "Progress over perfection. Effort over outcomes."
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            You're building habits that will last a lifetime. Keep showing up! 🌟
          </p>
        </div>
      </div>
    </div>
  );
}
