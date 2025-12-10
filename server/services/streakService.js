import Streak from '../models/Streak.js';

export async function updateStreak(userId, type, success, isGrace = false) {
  try {
    let streak = await Streak.findOne({ userId });
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    
    if (!streak) {
      streak = new Streak({ userId });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (type === 'attendance') {
      const lastUpdate = new Date(streak.attendanceStreak.lastUpdated);
      lastUpdate.setHours(0, 0, 0, 0);
      
      if (success) {
        // Check if it's a new day
        if (today > lastUpdate) {
          streak.attendanceStreak.current += 1;
          if (streak.attendanceStreak.current > streak.attendanceStreak.longest) {
            streak.attendanceStreak.longest = streak.attendanceStreak.current;
          }
        }
        streak.totalPoints += 10;
      } else {
        // Missed attendance - check for grace period
        if (today > lastUpdate) {
          // Check if user has grace available (1 per 7 days)
          if (user && !user.graceUsedThisWeek && !isGrace) {
            // Use grace day - streak maintained
            user.graceUsedThisWeek = true;
            user.lastGraceDate = today;
            await user.save();
            console.log(`🎁 Grace period used for user ${userId} - streak maintained`);
          } else {
            // No grace - streak breaks
            streak.attendanceStreak.current = 0;
          }
        }
      }
      
      streak.attendanceStreak.lastUpdated = today;
      
    } else if (type === 'task') {
      const lastUpdate = new Date(streak.taskStreak.lastUpdated);
      lastUpdate.setHours(0, 0, 0, 0);
      
      if (success) {
        if (today > lastUpdate) {
          streak.taskStreak.current += 1;
          if (streak.taskStreak.current > streak.taskStreak.longest) {
            streak.taskStreak.longest = streak.taskStreak.current;
          }
        }
        streak.totalPoints += 5;
      }
      
      streak.taskStreak.lastUpdated = today;
    }
    
    // Check for milestone badges
    checkAndAwardBadges(streak);
    
    await streak.save();
    return streak;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

function checkAndAwardBadges(streak) {
  const badges = [];
  
  // Attendance badges
  if (streak.attendanceStreak.current >= 7 && !streak.badges.some(b => b.name === 'Week Warrior')) {
    badges.push({
      name: 'Week Warrior',
      description: '7-day attendance streak!',
      earnedAt: new Date(),
      icon: '🔥'
    });
  }
  
  if (streak.attendanceStreak.current >= 30 && !streak.badges.some(b => b.name === 'Monthly Master')) {
    badges.push({
      name: 'Monthly Master',
      description: '30-day attendance streak!',
      earnedAt: new Date(),
      icon: '🏆'
    });
  }
  
  // Task badges
  if (streak.taskStreak.current >= 7 && !streak.badges.some(b => b.name === 'Task Tackler')) {
    badges.push({
      name: 'Task Tackler',
      description: '7-day task completion streak!',
      earnedAt: new Date(),
      icon: '✅'
    });
  }
  
  // Points badges
  if (streak.totalPoints >= 100 && !streak.badges.some(b => b.name === 'Century Club')) {
    badges.push({
      name: 'Century Club',
      description: '100 points earned!',
      earnedAt: new Date(),
      icon: '💯'
    });
  }
  
  if (badges.length > 0) {
    streak.badges.push(...badges);
  }
}

// Restore streak by completing 2 micro-tasks within 48 hours
export async function restoreStreakWithMicroTasks(userId) {
  try {
    const MicroTask = (await import('../models/MicroTask.js')).default;
    
    // Find completed micro-tasks in the last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const completedTasks = await MicroTask.find({
      userId,
      completed: true,
      streakRestoreEligible: true,
      completedAt: { $gte: fortyEightHoursAgo }
    });
    
    if (completedTasks.length >= 2) {
      const streak = await Streak.findOne({ userId });
      if (!streak) return null;
      
      // Restore 50% of previous streak
      const restoredAmount = Math.floor(streak.attendanceStreak.longest * 0.5);
      streak.attendanceStreak.current = restoredAmount;
      streak.totalPoints += 25; // Bonus for recovery
      
      // Add recovery badge
      if (!streak.badges.some(b => b.name === 'Comeback Kid')) {
        streak.badges.push({
          name: 'Comeback Kid',
          description: 'Restored streak through dedication!',
          earnedAt: new Date(),
          icon: '💪'
        });
      }
      
      await streak.save();
      
      // Mark micro-tasks as used for restore
      await MicroTask.updateMany(
        { _id: { $in: completedTasks.map(t => t._id) } },
        { streakRestoreEligible: false }
      );
      
      console.log(`✨ Streak restored to ${restoredAmount} for user ${userId}`);
      return streak;
    }
    
    return null;
  } catch (error) {
    console.error('Error restoring streak:', error);
    throw error;
  }
}

// Reset grace period weekly (call this on Sundays)
export async function resetWeeklyGrace() {
  try {
    const User = (await import('../models/User.js')).default;
    await User.updateMany(
      { graceUsedThisWeek: true },
      { graceUsedThisWeek: false }
    );
    console.log('✅ Weekly grace periods reset');
  } catch (error) {
    console.error('Error resetting grace:', error);
  }
}
