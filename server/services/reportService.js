import WeeklyReport from '../models/WeeklyReport.js';
import Attendance from '../models/Attendance.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import User from '../models/User.js';

export async function generateWeeklyReports() {
  try {
    console.log('📊 Generating weekly reports...');
    
    // Get all users
    const users = await User.find({});
    
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    for (const user of users) {
      try {
        // Get attendance data
        const attendance = await Attendance.find({
          userId: user._id,
          date: { $gte: weekStart, $lte: weekEnd }
        });
        
        const classesAttended = attendance.filter(a => a.status === 'attended').length;
        const classesMissed = attendance.filter(a => a.status === 'missed').length;
        
        // Get task data
        const tasks = await Task.find({
          userId: user._id,
          createdAt: { $gte: weekStart, $lte: weekEnd }
        });
        
        const tasksCompleted = tasks.filter(t => t.completed).length;
        const tasksPending = tasks.filter(t => !t.completed).length;
        
        // Get goal progress
        const goals = await Goal.find({
          userId: user._id,
          status: 'active'
        });
        
        const goalProgress = goals.map(g => ({
          goalId: g._id,
          goalTitle: g.title,
          progress: g.progress
        }));
        
        // Generate suggestions
        const suggestions = generateSuggestions(classesAttended, classesMissed, tasksCompleted, tasksPending);
        
        // Generate motivational message
        const motivationalMessage = generateWeeklyMotivation(user, classesAttended, classesMissed, tasksCompleted);
        
        // Create report
        const report = new WeeklyReport({
          userId: user._id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          classesAttended,
          classesMissed,
          tasksCompleted,
          tasksPending,
          goalProgress,
          suggestions,
          motivationalMessage
        });
        
        await report.save();
        console.log(`✅ Weekly report generated for ${user.name}`);
        
      } catch (error) {
        console.error(`Error generating report for user ${user._id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error in weekly report generation:', error);
  }
}

function generateSuggestions(attended, missed, completed, pending) {
  const suggestions = [];
  
  const attendanceRate = attended / (attended + missed) * 100;
  
  if (attendanceRate < 75) {
    suggestions.push('Try to attend at least 4 out of 5 classes this week');
  } else if (attendanceRate >= 90) {
    suggestions.push('Excellent attendance! Keep it up!');
  }
  
  if (pending > completed) {
    suggestions.push('Focus on completing pending tasks - break them into smaller chunks');
  }
  
  if (missed > 2) {
    suggestions.push('Set more reminders for classes you tend to miss');
  }
  
  if (completed > 5) {
    suggestions.push('Great task completion! Consider adding more challenging goals');
  }
  
  return suggestions;
}

function generateWeeklyMotivation(user, attended, missed, completed) {
  const style = user.motivationStyle || 'friendly';
  
  const messages = {
    friendly: `Hey ${user.name}! This week you attended ${attended} classes and completed ${completed} tasks. ${missed > 0 ? 'A few classes were missed, but that\'s okay!' : 'Perfect attendance!'} Keep up the great work! 🌟`,
    
    strict: `${user.name}, your weekly summary: ${attended} classes attended, ${missed} missed, ${completed} tasks done. ${missed > 0 ? 'Improve your attendance next week.' : 'Good discipline.'} Stay focused.`,
    
    chill: `Hey ${user.name}! You hit ${attended} classes and knocked out ${completed} tasks this week. ${missed > 0 ? 'Missed a few, no stress!' : 'Perfect week!'} Keep vibing! 😎`,
    
    hype: `${user.name}! WHAT A WEEK! 🔥 ${attended} CLASSES CRUSHED! ${completed} TASKS DEMOLISHED! ${missed === 0 ? 'PERFECT ATTENDANCE! YOU\'RE A LEGEND! 🏆' : 'A few misses but you\'re STILL AMAZING! Let\'s DOMINATE next week! 💪'}`
  };
  
  return messages[style] || messages.friendly;
}
