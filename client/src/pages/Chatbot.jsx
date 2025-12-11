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
      friendly: `Hey ${firstName}! 👋 I'm your study assistant. What can I help you with today?`,
      strict: `${firstName}, let’s get focused. What are we accomplishing now?`,
      chill: `Hey ${firstName}! 😎 Need help with anything?`,
      hype: `LET’S GO ${firstName}! 🔥 Ready to crush your studies today?`
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

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await chatbotAPI.sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm here with you. Tell me more so I can help." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">

        {/* Outer Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Bot className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Study Assistant</h2>
              <p className="text-xs text-gray-500">Ask me anything</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gray-50">
            {messages.map((message, i) => (
              <div key={i} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {message.role === 'bot' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}

                <div className={`max-w-[75%] px-4 py-2.5 rounded-lg text-sm
                    ${message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <UserIcon size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing dots */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg flex gap-1.5">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 px-6 py-4 bg-white">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none
                disabled:bg-gray-50 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg
                hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed 
                flex items-center gap-2"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Quick Suggestions */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {["Help me focus", "Study tips", "Need motivation", "Time management"].map((t) => (
                <button
                  key={t}
                  onClick={() => setInput(t)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-700
                    hover:bg-gray-50 hover:border-gray-300 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Chatbot;
