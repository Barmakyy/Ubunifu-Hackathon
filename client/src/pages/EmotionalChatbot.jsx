import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Send, Heart, Smile, Meh, Frown, Angry } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const moods = [
  { id: 'happy', icon: Smile, color: 'sage', label: 'Happy' },
  { id: 'calm', icon: Heart, color: 'violet', label: 'Calm' },
  { id: 'neutral', icon: Meh, color: 'dusty', label: 'Neutral' },
  { id: 'anxious', icon: Frown, color: 'coral', label: 'Anxious' },
  { id: 'stressed', icon: Angry, color: 'coral', label: 'Stressed' }
];

const cbtTasks = [
  {
    id: 1,
    type: 'breathing',
    title: 'Box Breathing',
    description: 'Breathe in for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat 4 times.',
    duration: 120,
    icon: '🫁'
  },
  {
    id: 2,
    type: 'gratitude',
    title: 'Three Good Things',
    description: 'Write down three things that went well today and why they happened.',
    duration: 300,
    icon: '✨'
  },
  {
    id: 3,
    type: 'grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.',
    duration: 180,
    icon: '🌍'
  },
  {
    id: 4,
    type: 'affirmation',
    title: 'Positive Affirmations',
    description: 'Repeat slowly: "I am capable. I am worthy. I am doing my best. Progress, not perfection."',
    duration: 60,
    icon: '💪'
  },
  {
    id: 5,
    type: 'mindfulness',
    title: 'Body Scan',
    description: 'Close your eyes. Notice tension in your shoulders, jaw, hands. Breathe and release.',
    duration: 120,
    icon: '🧘'
  }
];

export default function EmotionalChatbot() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: `Hi ${user?.firstName}! I'm here to support you. How are you feeling today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
    
    const responses = {
      happy: "That's wonderful! I'm so glad you're feeling good. Want to talk about what's going well?",
      calm: "That's beautiful. Finding peace is so important. How can I support you today?",
      neutral: "Thank you for sharing. Sometimes neutral is okay too. What's on your mind?",
      anxious: "I hear you. Anxiety is tough, but you're not alone. Let's work through this together. Would a breathing exercise help?",
      stressed: "That sounds really hard. You're doing your best, and that's enough. Want to try a quick stress-relief exercise?"
    };

    setMessages(prev => [...prev, {
      role: 'user',
      content: `I'm feeling ${mood.label.toLowerCase()}`,
      timestamp: new Date()
    }, {
      role: 'bot',
      content: responses[mood.id],
      timestamp: new Date(),
      suggestedTasks: mood.id === 'anxious' || mood.id === 'stressed' ? [cbtTasks[0], cbtTasks[4]] : []
    }]);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot response with supportive messages
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateBotResponse = (userInput) => {
    const lower = userInput.toLowerCase();
    let content = '';
    let suggestedTasks = [];

    if (lower.includes('anxious') || lower.includes('nervous') || lower.includes('worry')) {
      content = "Anxiety is really challenging, and I want you to know it's okay to feel this way. Your feelings are valid. Would you like to try a breathing exercise? It can help calm your nervous system.";
      suggestedTasks = [cbtTasks[0], cbtTasks[2]];
    } else if (lower.includes('stress') || lower.includes('overwhelm')) {
      content = "You're carrying a lot right now, and that's hard. Remember: one thing at a time. You don't have to do everything at once. Want to try a grounding exercise?";
      suggestedTasks = [cbtTasks[2], cbtTasks[4]];
    } else if (lower.includes('exam') || lower.includes('test')) {
      content = "Exam stress is so real. Remember: your worth isn't defined by a grade. You've prepared, and showing up is already brave. Want some affirmations to boost your confidence?";
      suggestedTasks = [cbtTasks[3], cbtTasks[0]];
    } else if (lower.includes('tired') || lower.includes('exhaust')) {
      content = "Burnout is real, and rest isn't failure—it's essential. Be kind to yourself. Have you taken a break today? Sometimes a short body scan can help you recharge.";
      suggestedTasks = [cbtTasks[4]];
    } else if (lower.includes('thank') || lower.includes('better') || lower.includes('help')) {
      content = "I'm so glad I could help. Remember, you're stronger than you think, and asking for support is a sign of strength, not weakness. I'm here whenever you need me. 💚";
    } else {
      content = "I'm listening. Tell me more about what you're experiencing. There's no judgment here, only support.";
      suggestedTasks = [cbtTasks[1]];
    }

    return {
      role: 'bot',
      content,
      timestamp: new Date(),
      suggestedTasks
    };
  };

  const startTask = (task) => {
    setActiveTask(task);
    setTaskProgress(0);
    
    const interval = setInterval(() => {
      setTaskProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeTask(task);
          return 100;
        }
        return prev + (100 / (task.duration / 1000));
      });
    }, 1000);
  };

  const completeTask = (task) => {
    toast.success(`Great job completing ${task.title}! 🌟`);
    setMessages(prev => [...prev, {
      role: 'bot',
      content: `Wonderful! You just completed "${task.title}". How are you feeling now? Remember, small steps like this add up to big changes.`,
      timestamp: new Date()
    }]);
    setActiveTask(null);
    setTaskProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-violet-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[1.5rem] shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-sage-500 to-violet-500 p-6 text-white">
            <h1 className="text-2xl font-bold mb-1">Your Emotional Companion</h1>
            <p className="text-sm opacity-90">A safe space for your thoughts and feelings</p>
          </div>

          {/* Messages */}
          <div className="h-[calc(100%-220px)] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-sage-500 text-white'
                      : 'bg-sage-50 text-sage-800 border-2 border-sage-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-sage-100' : 'text-sage-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Suggested CBT Tasks */}
                {message.suggestedTasks && message.suggestedTasks.length > 0 && (
                  <div className="mt-3 ml-12 space-y-2">
                    <p className="text-xs text-sage-600 font-medium">Try these exercises:</p>
                    {message.suggestedTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => startTask(task)}
                        className="w-full text-left p-3 bg-violet-50 hover:bg-violet-100 rounded-xl border-2 border-violet-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{task.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-violet-800 text-sm">{task.title}</h4>
                            <p className="text-xs text-violet-600">{Math.round(task.duration / 60)} min</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Active Task */}
            {activeTask && (
              <div className="bg-violet-100 rounded-2xl p-6 border-4 border-violet-300">
                <div className="text-center mb-4">
                  <span className="text-4xl mb-2 block">{activeTask.icon}</span>
                  <h3 className="text-lg font-bold text-violet-900 mb-1">{activeTask.title}</h3>
                  <p className="text-sm text-violet-700">{activeTask.description}</p>
                </div>
                
                <div className="w-full h-3 bg-violet-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 transition-all duration-1000"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
                
                <p className="text-center text-sm text-violet-700 mt-2">
                  {Math.round(taskProgress)}% Complete
                </p>
              </div>
            )}

            {/* Mood Selector */}
            {showMoodSelector && (
              <div className="bg-cream-50 rounded-2xl p-6 border-2 border-cream-200">
                <p className="text-sage-700 font-medium mb-3 text-center">How are you feeling right now?</p>
                <div className="grid grid-cols-5 gap-2">
                  {moods.map(mood => {
                    const Icon = mood.icon;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white transition-colors border-2 border-transparent hover:border-sage-300"
                      >
                        <Icon className={`text-${mood.color}-600`} size={28} />
                        <span className="text-xs text-sage-700">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-sage-100">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none transition-colors"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors flex items-center gap-2"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* CBT Tasks Quick Access */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-sage-800 mb-3">Quick Exercises</h3>
          <div className="grid grid-cols-5 gap-3">
            {cbtTasks.map(task => (
              <button
                key={task.id}
                onClick={() => startTask(task)}
                className="p-3 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors text-center"
                title={task.title}
              >
                <span className="text-3xl">{task.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
