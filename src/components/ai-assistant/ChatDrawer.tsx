import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MessageSquare } from 'lucide-react';
import { useEvent } from '../../hooks/useEvent';
import { useBudget } from '../../hooks/useBudget';
import { useVendors } from '../../hooks/useVendors';
import { useTasks } from '../../hooks/useTasks';
import { AiService } from '../../services/gemini/aiService';
import { AiChatMessage } from '../../types/ai';

export const ChatDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { event, guestSummary } = useEvent();
  const { summary: budgetSummary, currency } = useBudget();
  const { vendors } = useVendors();
  const { tasks } = useTasks();

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your EventWise AI Assistant. I have live context on **${event?.name || 'your event'}** (${currency} ${budgetSummary.totalBudget.toLocaleString()} budget, ${event?.guestCount || 0} guests, ${tasks.filter((t) => t.status !== 'completed').length} pending tasks). How can I assist your planning today?`,
      timestamp: Date.now(),
      suggestions: [
        'How can I trim catering costs without losing variety?',
        'What should the timeline look like for the big day?',
        'What questions should I ask my lead photographer?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading || !event) return;

    const userMsg: AiChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
      const bookedVendorsCount = vendors.filter((v) => v.bookingStatus === 'booked').length;

      const res = await AiService.chatWithAssistant({
        message: textToSend,
        eventContext: {
          name: event.name,
          category: event.category,
          eventDate: event.eventDate,
          currency: event.currency || 'INR',
          totalBudget: budgetSummary.totalBudget,
          totalSpent: budgetSummary.totalSpent,
          guestCount: event.guestCount,
          pendingTasksCount,
          bookedVendorsCount,
        },
        conversationHistory: messages.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
      });

      const assistantMsg: AiChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        suggestions: res.suggestions,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'Apologies, I encountered a connection issue. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      role="region"
      aria-label="EventWise AI Copilot Assistant"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white border-l border-charcoal-200 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-charcoal-100 flex items-center justify-between bg-background-subtle/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-charcoal">EventWise AI Copilot</h3>
            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              Live Context Synchronized
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI Copilot Assistant"
          className="p-1.5 text-charcoal-400 hover:text-charcoal rounded-lg hover:bg-charcoal-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Messages */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 p-4 overflow-y-auto space-y-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[88%]">
              {m.sender === 'assistant' && (
                <div
                  aria-hidden="true"
                  className="w-6 h-6 rounded-lg bg-primary-100 text-primary flex items-center justify-center shrink-0 mt-0.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-background-subtle text-charcoal border border-charcoal-100 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>

            {/* Suggestions */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="mt-2.5 ml-8 flex flex-wrap gap-1.5">
                {m.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s)}
                    aria-label={`Ask AI: ${s}`}
                    className="text-[11px] bg-primary-50 text-primary-800 hover:bg-primary-100 border border-primary-200 px-2.5 py-1 rounded-full text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    💬 {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-xs text-charcoal-500 p-2">
            <Bot className="w-4 h-4 text-primary animate-pulse" aria-hidden="true" />
            <span>AI is analyzing your event workspace...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3.5 border-t border-charcoal-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            aria-label="Ask AI about budget, tasks, or ideas"
            placeholder="Ask AI about budget, tasks, or ideas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-background-subtle border border-charcoal-200 text-charcoal text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-800 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </aside>
  );
};

