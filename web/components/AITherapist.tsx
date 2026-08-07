'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'therapist';
  content: string;
  timestamp: Date;
}

export default function AITherapist({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'therapist',
      content: "Hi there. I'm here to listen and support you on your skin journey. How are you feeling about your skin today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (in production, this would call an LLM API)
    setTimeout(() => {
      const therapistResponse = generateTherapeuticResponse(userMessage.content);
      setMessages((prev) => [
        ...prev,
        {
          role: 'therapist',
          content: therapistResponse,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const generateTherapeuticResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Emotional validation patterns
    if (lowerInput.includes('hate') || lowerInput.includes('ugly') || lowerInput.includes('awful')) {
      return "I hear you, and those feelings are completely valid. It's really hard when your skin doesn't feel like it's cooperating. You're not alone in feeling this way. Can you tell me more about what's been particularly challenging lately?";
    }

    if (lowerInput.includes('stressed') || lowerInput.includes('anxious') || lowerInput.includes('worried')) {
      return "Stress and anxiety about skin can feel overwhelming. It's okay to feel this way. Sometimes, acknowledging the stress is the first step toward feeling a bit lighter. What's been causing the most stress for you?";
    }

    if (lowerInput.includes('better') || lowerInput.includes('improved') || lowerInput.includes('good')) {
      return "That's wonderful to hear! I'm so glad you're noticing positive changes. Celebrating these moments, even small ones, is important. What do you think has been helping?";
    }

    if (lowerInput.includes('routine') || lowerInput.includes('product') || lowerInput.includes('skincare')) {
      return "I'd love to hear about what you're currently doing. Remember, there's no one-size-fits-all approach—what works for your skin is what matters. What does your current routine look like?";
    }

    if (lowerInput.includes('red') || lowerInput.includes('sensitive') || lowerInput.includes('irritated')) {
      return "Sensitivity and redness can be really uncomfortable, both physically and emotionally. It sounds like your skin might be asking for a little extra gentleness right now. Have you noticed any patterns in when this happens?";
    }

    // Default empathetic response
    return "Thank you for sharing that with me. I'm here to listen and support you. Your skin journey is unique, and so are your feelings about it. What would be most helpful for you right now—talking through what you're experiencing, or exploring some gentle ways to support your skin?";
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col p-4">
        <button
          onClick={onBack}
          className="mb-4 text-[#7A9370] hover:text-[#9CAF88] transition-colors self-start"
        >
          ← Back
        </button>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-[#E8E0D3] flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#E8E0D3]">
            <h2 className="text-3xl font-light text-[#7A9370] mb-2">Your AI Therapist</h2>
            <p className="text-sm text-[#6B6B6B]">A compassionate companion for your skin journey</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#A8C5D9] to-[#C4D9E8] text-white'
                      : 'bg-[#F5F1E8] text-[#6B6B6B]'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#F5F1E8] rounded-2xl p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#9CAF88] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-[#E8E0D3]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share how you're feeling..."
                className="flex-1 bg-white border border-[#E8E0D3] rounded-2xl px-4 py-3 text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-[#9CAF88] to-[#B8D4A6] text-white px-6 py-3 rounded-2xl font-light hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

