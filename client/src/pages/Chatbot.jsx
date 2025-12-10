import { useState } from 'react';
import { chatbotAPI } from '../utils/api';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function Chatbot() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'there';
  
  const getInitialMessage = () => {
    const style = user?.motivationStyle || 'friendly';
    const messages = {
      friendly: `Hey ${firstName}! 👋 I'm your study buddy. Whether you're crushing it or struggling, I'm here to help. What are you working on today?`,
      strict: `${firstName}, ready to get to work? Tell me what you need to accomplish today and let's make it happen. No excuses.`,
      chill: `Hey ${firstName}! 😎 What's up? Just checking in to see how your studies are going. No pressure, just here if you need anything.`,
      hype: `YO ${firstName}! 🔥 LET'S GO! Ready to DOMINATE your studies today?! Tell me what you're working on and let's CRUSH IT! 💪`
    };
    return messages[style] || messages.friendly;
  };

  const [messages, setMessages] = useState([
    { role: 'bot', content: getInitialMessage() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await chatbotAPI.sendMessage(userMessage);
      
      // Add bot response
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm here to support you! Could you tell me more about what's on your mind?" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full">
              <Bot className="text-primary-600" size={24} />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Study Buddy</h2>
              <p className="text-primary-100 text-sm">Real-time study session assistant • {user?.motivationStyle} mode</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-primary-600' : 'bg-gray-200'
              }`}>
                {message.role === 'user' ? (
                  <UserIcon size={18} className="text-white" />
                ) : (
                  <Bot size={18} className="text-gray-600" />
                )}
              </div>
              
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot size={18} className="text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                focus:ring-primary-500 focus:border-transparent outline-none
                disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                flex items-center gap-2"
            >
              <Send size={20} />
            </button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Help me focus right now",
              "I'm procrastinating",
              "Give me a study break idea",
              "Check in on my progress",
              "I need motivation!",
              "What should I tackle first?"
            ].map((msg) => (
              <button
                key={msg}
                onClick={() => setInput(msg)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg
                  hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
