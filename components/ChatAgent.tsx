import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  Package,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChatMessage, WidgetData } from '../types';
import { getAgentResponse } from '../services/llmService';
import { useDataStore } from '../stores/dataStore';
import { useVoice } from '../hooks/useVoice';
import { rateLimiter } from '../lib/rateLimiter';
import { motion, AnimatePresence } from 'framer-motion';

const ChatAgent: React.FC = () => {
  const { products, orders } = useDataStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    speak,
    isSpeaking: _isSpeaking,
  } = useVoice({
    onResult: (text) => {
      if (voiceMode) {
        handleSend(text);
      }
    },
  });

  const messageCounter = useRef(0);

  // Include loading indicator as a virtual row when active
  const rowCount = messages.length + (isLoading ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const scrollToBottom = useCallback(() => {
    if (rowCount > 0) {
      virtualizer.scrollToIndex(rowCount - 1, { align: 'end', behavior: 'smooth' });
    }
  }, [rowCount, virtualizer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    if (!rateLimiter.canCall('chat')) {
      const remaining = Math.ceil(rateLimiter.getRemainingCooldown('chat') / 1000);
      const throttleMsg: ChatMessage = {
        id: `throttle-${Date.now()}-${++messageCounter.current}`,
        role: 'model',
        content: `Please wait ${remaining}s before sending another message.`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, throttleMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${++messageCounter.current}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const rawResponse = await getAgentResponse(text, products, orders);

      let parsedResponse: {
        text: string;
        ui_widget?: 'product_card' | 'order_card' | 'none';
        widget_data?: WidgetData;
      } = {
        text: '',
        ui_widget: 'none',
      };

      try {
        if (typeof rawResponse === 'object') {
          parsedResponse = rawResponse;
        } else if (rawResponse.trim().startsWith('{')) {
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : rawResponse;
          parsedResponse = JSON.parse(jsonString);
        } else {
          parsedResponse = { text: rawResponse, ui_widget: 'none' };
        }
      } catch (_e) {
        parsedResponse = { text: rawResponse, ui_widget: 'none' };
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}-${++messageCounter.current}`,
        role: 'model',
        content: parsedResponse.text || 'Processed.',
        widget: parsedResponse.ui_widget,
        widgetData: parsedResponse.widget_data,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Auto-speak response in voice mode
      if (voiceMode && parsedResponse.text) {
        speak(parsedResponse.text);
      }
    } catch (_error) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}-${++messageCounter.current}`,
        role: 'model',
        content: 'Network error. Please try again.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    { icon: <TrendingUp className="w-4 h-4" />, text: "Analyze this week's sales trends" },
    { icon: <Package className="w-4 h-4" />, text: 'Which products are low on stock?' },
    { icon: <MessageSquare className="w-4 h-4" />, text: 'Draft a polite refund email' },
  ];

  const renderWidget = (msg: ChatMessage) => {
    if (msg.widget === 'product_card' && msg.widgetData && 'name' in msg.widgetData) {
      const p = msg.widgetData as import('../types').ProductWidgetData;
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-black/5 dark:border-white/5 shadow-sm flex items-center gap-4 max-w-sm group cursor-pointer hover:shadow-md transition-all">
          <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-inner">
            <img
              src={p.image || 'https://via.placeholder.com/50'}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white truncate">{p.name || 'Unknown Product'}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock: {p.stock ?? 0}</span>
              <span className="text-xs font-black text-ios-blue">${p.price ?? 0}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] ios-card !p-0 overflow-hidden shadow-2xl border-none">
      {/* iOS Header */}
      <div className="ios-glass p-5 flex items-center gap-4 z-20">
        <div className="relative">
          <div className="w-12 h-12 bg-ios-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-ios-blue/30 ring-4 ring-ios-blue/10">
            <Bot className="w-7 h-7" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-ios-green rounded-full border-4 border-white dark:border-zinc-900" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">AutoAgent AI</h2>
          <p className="text-[10px] font-black text-ios-blue uppercase tracking-[0.2em]">Apple Intelligence Engine</p>
        </div>

        {isSupported && (
          <button
            onClick={() => setVoiceMode(!voiceMode)}
            className={`p-3 rounded-full transition-all ${
              voiceMode
                ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/20'
                : 'bg-black/5 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white'
            }`}
          >
            {voiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-black/20 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 bg-ios-blue/10 rounded-[2.5rem] flex items-center justify-center mb-8 animate-pulse">
              <Sparkles className="w-12 h-12 text-ios-blue" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">How can I help you?</h3>
            <p className="text-slate-400 dark:text-zinc-500 max-w-xs mb-10 font-medium">
              I have full access to your Shopify store. Ask me to analyze sales or draft emails.
            </p>
            <div className="grid gap-3 w-full max-w-sm">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-ios-blue/5 rounded-xl group-hover:bg-ios-blue/10 transition-colors">
                      {React.cloneElement(s.icon as React.ReactElement, { className: 'w-4 h-4 text-ios-blue' })}
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-zinc-300">{s.text}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
            className="p-6"
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const isLoadingRow = virtualRow.index === messages.length;

              if (isLoadingRow) {
                return (
                  <div
                    key="loading"
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="flex items-end gap-3 mb-4"
                  >
                    <div className="w-8 h-8 rounded-xl bg-ios-blue flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-3 px-4 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-ios-blue/40 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-ios-blue/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-ios-blue rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                );
              }

              const msg = messages[virtualRow.index];
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-2`}
                >
                  <div className={`flex gap-3 max-w-[90%] ${isUser ? 'flex-row-reverse' : ''}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-ios-blue flex-shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={isUser ? 'text-right' : 'text-left'}>
                      <div
                        className={`inline-block px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm font-medium
                        ${
                          isUser
                            ? 'bg-ios-blue text-white rounded-tr-[4px]'
                            : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-black/5 dark:border-white/5 rounded-tl-[4px]'
                        } ${msg.isError ? 'bg-ios-red/10 text-ios-red border-ios-red/20' : ''}`}
                      >
                        {msg.content}
                      </div>
                      {!isUser && renderWidget(msg)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* iOS Input Area */}
      <div className="p-6 ios-glass border-t border-black/5 dark:border-white/5">
        <div className="relative max-w-4xl mx-auto flex items-end gap-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner-lg focus-within:ring-2 focus-within:ring-ios-blue transition-all duration-300">
          <textarea
            value={isListening ? transcript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            className={`flex-1 bg-transparent border-none focus:ring-0 p-3 max-h-32 min-h-[48px] resize-none text-slate-800 dark:text-zinc-200 placeholder-slate-400 font-medium ${isListening ? 'text-ios-blue animate-pulse' : ''}`}
            rows={1}
            readOnly={isListening}
          />

          <div className="flex items-center gap-2 pr-1 pb-1">
            {isSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-ios-red text-white shadow-lg animate-pulse'
                    : 'text-slate-400 hover:text-ios-blue hover:bg-ios-blue/5'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && !isListening)}
              className="p-2.5 bg-ios-blue hover:opacity-90 disabled:opacity-30 text-white rounded-xl shadow-lg shadow-ios-blue/20 transition-all flex items-center justify-center active:scale-90"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAgent;
