import TimetableEntry from '../models/TimetableEntry.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import MicroTask, { microTaskTemplates } from '../models/MicroTask.js';

// Message templates based on motivation style and persona
const messageTemplates = {
  friendly: {
    pre30: (name, className) => `Hey ${name} — ${className} in 30 mins. Quick plan: bring notes + focus for 50 mins. You got this 💪`,
    pre10: (name, className) => `${className} starts in 10 minutes! Time to get ready ✨`,
    start: (name, className) => `It's time — ${className} starts now. Tap 'I'm in' to save your streak.`,
    missed: (name, className) => `No sweat, ${name}. You missed ${className} — let's do a 15-min catch-up now.`,
    microTaskSuccess: () => `Nice! 15 mins done. Streak safe 🔥 — keep the momentum.`
  },
  strict: {
    pre30: (name, className) => `${name}, ${className} starts in 30m. Be there.`,
    pre10: (name, className) => `${className} in 10 minutes. Get moving.`,
    start: (name, className) => `${className} starts now. Check in immediately.`,
    missed: (name, className) => `You missed ${className}. That's one step back. Do 20 mins now to keep your goal alive.`,
    microTaskSuccess: () => `Task complete. Stay disciplined.`
  },
  chill: {
    pre30: (name, className) => `Reminder: ${className} in 30 mins — gentle nudge.`,
    pre10: (name, className) => `Hey, ${className} in 10. No pressure.`,
    start: (name, className) => `${className} is starting. You got this.`,
    missed: (name, className) => `It's okay. You missed ${className}. If you want, try a 10-min review. I'm here.`,
    microTaskSuccess: () => `Nice work. Small wins add up.`
  },
  hype: {
    pre30: (name, className) => `${name}, time to level up! ${className} starts in 30 — collect XP by checking in!`,
    pre10: (name, className) => `LET'S GO! ${className} in 10 minutes! Time to DOMINATE! 🔥`,
    start: (name, className) => `IT'S TIME! ${className} RIGHT NOW! Show up and WIN!`,
    missed: (name, className) => `Streak down! Quick 15 min task = +XP and glimmer badge. Let's bounce back!`,
    microTaskSuccess: () => `BOOM! CRUSHING IT! Keep that energy! 💥🔥`
  }
};

export async function scheduleClassReminders() {
  try {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Find all classes happening today
    const todayClasses = await TimetableEntry.find({
      dayOfWeek: currentDay,
      remindersEnabled: true
    });
    
    for (const classEntry of todayClasses) {
      // Check if reminders should be sent (30 min, 10 min, at start)
      const classTimeParts = classEntry.startTime.split(':');
      const classHour = parseInt(classTimeParts[0]);
      const classMinute = parseInt(classTimeParts[1]);
      
      const classDateTime = new Date(now);
      classDateTime.setHours(classHour, classMinute, 0, 0);
      
      const timeDiff = (classDateTime - now) / 1000 / 60; // difference in minutes
      
      // Check if we should send reminder (within 1 minute window)
      if ((timeDiff >= 29 && timeDiff <= 31) || 
          (timeDiff >= 9 && timeDiff <= 11) || 
          (timeDiff >= -1 && timeDiff <= 1)) {
        
        // Check if attendance already marked
        const existingAttendance = await Attendance.findOne({
          userId: classEntry.userId,
          timetableEntryId: classEntry._id,
          date: {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
            $lt: new Date(now.setHours(23, 59, 59, 999))
          }
        });
        
        if (!existingAttendance || existingAttendance.status === 'pending') {
          const user = await User.findById(classEntry.userId);
          
          if (user && shouldSendNotification(user, now)) {
            // Get personalized message based on user's motivation style
            const templates = messageTemplates[user.motivationStyle] || messageTemplates.friendly;
            let message;
            
            if (timeDiff >= 29 && timeDiff <= 31) {
              message = templates.pre30(user.name, classEntry.title);
            } else if (timeDiff >= 9 && timeDiff <= 11) {
              message = templates.pre10(user.name, classEntry.title);
            } else if (timeDiff >= -1 && timeDiff <= 1) {
              message = templates.start(user.name, classEntry.title);
            }
            
            console.log(`📢 ${message}`);
            // In production: send push notification with message
          }
          
          // Create pending attendance if doesn't exist
          if (!existingAttendance) {
            const attendance = new Attendance({
              userId: classEntry.userId,
              timetableEntryId: classEntry._id,
              date: new Date(),
              status: 'pending'
            });
            await attendance.save();
          }
        }
      }
      
      // Auto-mark as missed if 20 minutes past start and no check-in (attendance window)
      if (timeDiff < -20 && timeDiff > -25) {
        const pendingAttendance = await Attendance.findOne({
          userId: classEntry.userId,
          timetableEntryId: classEntry._id,
          date: {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
            $lt: new Date(now.setHours(23, 59, 59, 999))
          },
          status: 'pending'
        });
        
        if (pendingAttendance) {
          const user = await User.findById(classEntry.userId);
          
          // Mark as missed
          pendingAttendance.status = 'missed';
          pendingAttendance.motivationalNote = await generateMotivationalNote(
            classEntry.userId,
            'missed',
            classEntry.title
          );
          await pendingAttendance.save();
          
          console.log(`❌ Auto-marked as missed: ${classEntry.title} for user ${classEntry.userId}`);
          
          // Create micro-task immediately (within 2 minutes)
          const microTask = await createMicroTaskForMissedClass(user, classEntry);
          
          // Send missed notification with micro-task
          if (user && shouldSendNotification(user, now)) {
            const templates = messageTemplates[user.motivationStyle] || messageTemplates.friendly;
            const message = templates.missed(user.name, classEntry.title);
            console.log(`📱 ${message}`);
            console.log(`📝 Micro-task created: ${microTask.title}`);
            // In production: send push with micro-task link
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in reminder service:', error);
  }
}

// Helper functions
function shouldSendNotification(user, currentTime) {
  // Check DND window
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();
  const currentTimeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  
  if (user.dndStart && user.dndEnd) {
    // Simple time comparison (doesn't handle overnight DND perfectly, but good enough)
    if (currentTimeStr >= user.dndStart || currentTimeStr <= user.dndEnd) {
      return false;
    }
  }
  
  // In production: check notification count today against maxNotificationsPerDay
  return true;
}

async function createMicroTaskForMissedClass(user, classEntry) {
  // Randomly select a micro-task type weighted by persona
  let taskType;
  switch (user.motivationPersona) {
    case 'hustler':
      taskType = 'do_mcqs'; // Quick, competitive
      break;
    case 'anxious':
      taskType = 'read_slides'; // Structured, clear
      break;
    case 'busy':
      taskType = 'voice_note'; // Fast, minimal friction
      break;
    case 'skeptic':
      taskType = 'summarize'; // Thoughtful, independent
      break;
    default:
      taskType = 'read_slides';
  }
  
  const template = microTaskTemplates[taskType];
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
  
  const microTask = new MicroTask({
    userId: user._id,
    relatedClassId: classEntry._id,
    type: taskType,
    title: template.title,
    description: template.description.replace('{className}', classEntry.title),
    estimatedMinutes: template.estimatedMinutes,
    expiresAt,
    streakRestoreEligible: true
  });
  
  await microTask.save();
  return microTask;
}

async function generateMotivationalNote(userId, status, className) {
  // Import here to avoid circular dependency
  const { generateMotivationalNote: genNote } = await import('./motivationService.js');
  return genNote(userId, status, className);
}
