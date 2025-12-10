import User from '../models/User.js';

const motivationTemplates = {
  friendly: {
    attended: [
      "Great job showing up today! 🌟 Keep this momentum going!",
      "You're doing amazing! Every class attended is a step forward.",
      "Nice work! Your consistency is really paying off."
    ],
    missed: [
      "Hey, missed {className} today. No worries, everyone has off days. Try reviewing notes for 15 minutes?",
      "Don't stress about missing {className}. Small steps count - catch up when you can!",
      "Missed {className}, but tomorrow's a fresh start! You've got this."
    ]
  },
  strict: {
    attended: [
      "Good. Keep this consistency up.",
      "Attended as expected. Stay disciplined.",
      "On track. Don't break the pattern."
    ],
    missed: [
      "You missed {className}. This affects your goals. Make it up today.",
      "Missed {className}. No excuses - review the material now.",
      "{className} was missed. Get back on track immediately."
    ]
  },
  chill: {
    attended: [
      "Nice, you made it! 😎",
      "Cool, another one done!",
      "You showed up - that's what matters!"
    ],
    missed: [
      "Missed {className}? All good, just catch up when you can.",
      "Skipped {className}. No big deal, just don't make it a habit!",
      "Hey, {className} was missed. Take it easy but try to review later."
    ]
  },
  hype: {
    attended: [
      "YES! 🔥 You're crushing it! Keep that fire burning!",
      "AMAZING! Another class conquered! You're unstoppable!",
      "LET'S GO! 🚀 You're building something special!"
    ],
    missed: [
      "Missed {className} but you're STILL a champion! Bounce back stronger!",
      "Hey, we all stumble! But champions get back up - let's crush the next one! 💪",
      "{className} was missed but your journey isn't over! Come back STRONGER!"
    ]
  }
};

export async function generateMotivationalNote(userId, status, className = 'class') {
  try {
    const user = await User.findById(userId);
    const style = user?.motivationStyle || 'friendly';
    
    const templates = motivationTemplates[style]?.[status] || motivationTemplates.friendly[status];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template.replace('{className}', className);
  } catch (error) {
    console.error('Error generating motivational note:', error);
    return status === 'attended' 
      ? 'Great job attending!' 
      : 'Missed class, but you can catch up!';
  }
}
