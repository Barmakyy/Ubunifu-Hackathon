import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Emotion detection keywords
const emotionPatterns = {
  behind: ['behind', 'late', 'catch up', 'falling behind', 'not keeping up'],
  stressed: ['stressed', 'anxious', 'overwhelm', 'panic', 'pressure', 'too much'],
  cheat: ['cheat', 'cheating', 'copy', 'plagiarize', 'shortcut'],
  crisis: ['depressed', 'suicide', 'kill myself', 'worthless', 'end it', 'no point'],
  motivated: ['motivated', 'excited', 'ready', 'let\'s go', 'pumped'],
  tired: ['tired', 'exhausted', 'burnt out', 'can\'t focus', 'distracted']
};

export async function getChatbotResponse(userMessage, user) {
  try {
    const lowerMessage = userMessage.toLowerCase();
    
    // Crisis detection - immediate escalation
    if (emotionPatterns.crisis.some(word => lowerMessage.includes(word))) {
      return `${user.name}, I'm really concerned about what you're going through. Please reach out to someone who can help:\n\n🆘 Kenya Crisis Helpline: 0800 720 990\n💚 Befrienders Kenya: +254 722 178 177\n\nYou matter, and there are people who care. Would you like me to help you find a counselor at your institution?`;
    }
    
    // Detect emotion for context
    let emotionContext = '';
    if (emotionPatterns.behind.some(word => lowerMessage.includes(word))) {
      emotionContext = 'Student feels behind on work. Provide micro-action and encouragement.';
    } else if (emotionPatterns.stressed.some(word => lowerMessage.includes(word))) {
      emotionContext = 'Student is stressed. Offer calming advice and break things down.';
    } else if (emotionPatterns.cheat.some(word => lowerMessage.includes(word))) {
      emotionContext = 'Student considering cheating. Non-judgmentally explain consequences and offer immediate catch-up plan.';
    } else if (emotionPatterns.motivated.some(word => lowerMessage.includes(word))) {
      emotionContext = 'Student is motivated. Channel energy into action!';
    } else if (emotionPatterns.tired.some(word => lowerMessage.includes(word))) {
      emotionContext = 'Student is tired/unfocused. Suggest reset or micro-break.';
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const motivationStyleGuide = {
      friendly: "Be warm, encouraging, and supportive. Use casual language. Sound like a caring friend.",
      strict: "Be direct, disciplined, and firm but fair. Focus on accountability and results. No excuses.",
      chill: "Be relaxed, laid-back, and casual. Don't stress them out. Keep it light and easygoing.",
      hype: "Be extremely enthusiastic, energetic, and motivational! Use exclamation marks! Make them feel like a champion!"
    };
    
    const prompt = `You are ${user.name}'s personal study accountability buddy helping them during their study sessions in real-time. 

YOUR PERSONALITY STYLE: ${user.motivationStyle.toUpperCase()}
${motivationStyleGuide[user.motivationStyle] || motivationStyleGuide.friendly}

STUDENT CONTEXT:
- Name: ${user.name}
- Course: ${user.course || 'Not specified'}
- Year: ${user.year || 'Not specified'}
- Goals: ${user.semesterGoals?.length > 0 ? user.semesterGoals.join(', ') : 'Building consistent study habits'}
${emotionContext ? `\nEMOTIONAL STATE: ${emotionContext}` : ''}

YOUR ROLE:
- Have natural, conversational dialogue like texting a friend
- Provide specific, actionable study advice (10-20 minute micro-tasks)
- Help them stay focused and motivated during study sessions
- Break down overwhelming tasks into manageable steps
- Celebrate wins and give gentle accountability when needed
- If student mentions cheating: non-judgmentally explain long-term costs, offer immediate 20-min catch-up plan
- If student feels behind: "That's normal. What's one tiny thing you can do in 15 minutes now?" + suggest specific task
- If stressed: Empathy first, then one micro-action

CONVERSATION STYLE:
- Keep responses concise (2-4 sentences)
- Always end with ONE clear call-to-action or question
- Match their energy level and be relatable
- Use their name occasionally

Student's message: "${userMessage}"

Respond as their study buddy:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Chatbot error:', error);
    return "I'm here to support you! Could you tell me a bit more about what's on your mind?";
  }
}
