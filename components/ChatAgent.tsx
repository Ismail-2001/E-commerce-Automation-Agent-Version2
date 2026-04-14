import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, Package, MessageSquare, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChatMessage, WidgetData } from '../types';
import { getAgentResponse } from '../services/llmService';
import { useDataStore } from '../stores/dataStore';
import { useVoice } from '../hooks/useVoice';
import { rateLimiter } from '../lib/rateLimiter';

const ChatAgent: React.FC = () => {
  const { products, orders } = useDataStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, isSupported, startListening, stopListening, speak, isSpeaking } = useVoice({
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
      setMessages(prev => [...prev, throttleMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${++messageCounter.current}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const rawResponse = await getAgentResponse(text, products, orders);

      let parsedResponse: { text: string; ui_widget?: 'product_card' | 'order_card' | 'none'; widget_data?: WidgetData } = {
        text: "",
        ui_widget: "none"
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
      } catch (e) {
        parsedResponse = { text: rawResponse, ui_widget: 'none' };
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}-${++messageCounter.current}`,
        role: 'model',
        content: parsedResponse.text || "Processed.",
        widget: parsedResponse.ui_widget,
        widgetData: parsedResponse.widget_data,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

      // Auto-speak response in voice mode
      if (voiceMode && parsedResponse.text) {
        speak(parsedResponse.text);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}-${++messageCounter.current}`,
        role: 'model',
        content: "Network error. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
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
    { icon: <Package className="w-4 h-4" />, text: "Which products are low on stock?" },
    { icon: <MessageSquare className="w-4 h-4" />, text: "Draft a polite refund email" },
  ];

  const renderWidget = (msg: ChatMessage) => {
    if (msg.widget === 'product_card' && msg.widgetData && 'name' in msg.widgetData) {
      const p = msg.widgetData as import('../types').ProductWidgetData;
      return (
        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-4 max-w-sm">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
            <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{p.name || "Unknown Product"}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Stock: {p.stock ?? 0}</span>
              <span className="font-bold text-indigo-600">${p.price ?? 0}</span>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-200 transition-colors">
            Restock
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3 shadow-sm z-10">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">AutoAgent Command Center</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-gray-500 font-medium">DeepSeek V3 Active</span>
          </div>
        </div>

        {/* Voice Mode Toggle */}
        {isSupported && (
          <button
            onClick={() => setVoiceMode(!voiceMode)}
            className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              voiceMode
                ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {voiceMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            Voice {voiceMode ? 'On' : 'Off'}
          </button>
        )}
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">How can I help you grow?</h3>
            <p className="text-gray-500 max-w-md mb-8">
              I'm connected to your inventory and sales data. Ask me anything about your business performance.
            </p>
            <div className="grid gap-3 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md hover:text-indigo-600 transition-all text-left text-gray-700 font-medium group"
                >
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    {s.icon}
                  </div>
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const isLoadingRow = virtualRow.index === messages.length;

              if (isLoadingRow) {
                return (
                  <div
                    key="loading"
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
                    className="px-4 py-3"
                  >
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                );
              }

              const msg = messages[virtualRow.index];
              return (
                <div
                  key={msg.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
                  className="px-4 py-3"
                >
                  <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm
                      ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-indigo-600 text-white'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className="max-w-[80%]">
                      <div className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed whitespace-pre-wrap
                        ${msg.role === 'user'
                          ? 'bg-gray-900 text-white rounded-tr-none'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                        } ${msg.isError ? 'bg-red-50 text-red-600 border-red-100' : ''}`}>
                        {msg.content}
                      </div>
                      {msg.role === 'model' && renderWidget(msg)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all shadow-sm">
          <textarea
            value={isListening ? transcript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Ask AutoAgent anything...'}
            className={`flex-1 bg-transparent border-none focus:ring-0 p-3 max-h-32 min-h-[50px] resize-none text-gray-800 placeholder-gray-400 ${isListening ? 'text-indigo-600' : ''}`}
            rows={1}
            readOnly={isListening}
          />

          {/* Mic Button */}
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-xl transition-all shadow-sm mb-0.5 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !isListening)}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-sm mb-0.5"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          AI can make mistakes. Please check important information.
        </p>
      </div>
    </div>
  );
};

export default ChatAgent;
