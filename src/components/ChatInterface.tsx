/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Download, Bot, User, CornerDownLeft, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage, ChatRule, ChatbotConfig, RuleEvalTrace } from '../types/chatbot';
import { evaluateRules, playChime } from '../services/ruleEngine';
import { TraceInspector } from './TraceInspector';

interface ChatInterfaceProps {
  rules: ChatRule[];
  config: ChatbotConfig;
  setConfig: React.Dispatch<React.SetStateAction<ChatbotConfig>>;
}

const QUICK_PROMPTS = [
  { label: 'hello', prompt: 'hello' },
  { label: 'how are you', prompt: 'how are you' },
  { label: 'bye', prompt: 'bye' },
  { label: 'who are you', prompt: 'who are you' },
  { label: 'tell me a joke', prompt: 'tell me a joke' },
  { label: 'what time is it', prompt: 'what time is it' },
  { label: 'unmatched query', prompt: 'can you fly a rocket to mars?' },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ rules, config }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Hello! I am a simple rule-based chatbot. Try asking me: 'hello', 'how are you', or 'bye'.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTrace, setActiveTrace] = useState<RuleEvalTrace | null>(null);
  const [isLoopBroken, setIsLoopBroken] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (config.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : input;
    const trimmed = rawText.trim();
    if (!trimmed || isTyping) return;

    if (config.soundEnabled) {
      playChime('send');
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Evaluate rules deterministically
    const trace = evaluateRules(trimmed, rules);
    setActiveTrace(trace);

    setIsTyping(true);

    const delay = config.simulatedDelayMs;
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: trace.chosenResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedRuleId: trace.matchedRule?.id,
        matchedRuleName: trace.matchedRule?.name || 'Fallback Else',
        isExitMessage: trace.isExit,
        trace,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (trace.isExit) {
        setIsLoopBroken(true);
        if (config.soundEnabled) {
          playChime('exit');
        }
      } else if (config.soundEnabled) {
        playChime('reply');
      }
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetSession = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: "Conversation reset! Loop restarted. Try 'hello', 'how are you', or 'bye'.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveTrace(null);
    setIsLoopBroken(false);
    inputRef.current?.focus();
  };

  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'You' : 'Bot'}: ${m.text}`)
      .join('\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rulebot-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Banner / Scope Highlights */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900">Task 4: Basic Rule-Based Chatbot</span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-600">Pure Deterministic Logic</span>
            </div>
            <p className="text-xs text-zinc-500">
              Trigger predefined replies like <code className="text-indigo-600 font-mono">"Hi!"</code>,{' '}
              <code className="text-indigo-600 font-mono">"I'm fine, thanks!"</code>, and{' '}
              <code className="text-indigo-600 font-mono">"Goodbye!"</code> using an if-elif ladder.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            title="Reset conversation loop"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
            <span>Reset Loop</span>
          </button>
          <button
            onClick={handleExportChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            title="Download text transcript"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main split grid: Chat Window + Execution Logic Trace */}
      <div
        className={`grid gap-6 ${
          config.showTrace ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-3xl mx-auto'
        }`}
      >
        {/* Chat Card */}
        <div
          className={`flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden h-[660px] ${
            config.showTrace ? 'lg:col-span-7' : 'w-full'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3 bg-zinc-50/60">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLoopBroken ? 'bg-amber-400' : 'animate-ping bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    isLoopBroken ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span className="text-xs font-semibold text-zinc-800">
                {isLoopBroken ? 'Loop Broken (User exited)' : 'Interactive Event Loop Active'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{messages.length} messages</span>
              <span aria-hidden="true">·</span>
              <span>{rules.filter((r) => r.enabled).length} active rules</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/30">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-medium shadow-2xs ${
                      isUser
                        ? 'bg-zinc-900 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-zinc-900 text-white rounded-tr-xs'
                          : 'bg-white border border-zinc-200 text-zinc-900 shadow-2xs rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Metadata line (Clean, unboxed text per constitution) */}
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400 px-1">
                      <span>{msg.timestamp}</span>
                      {!isUser && msg.matchedRuleName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <button
                            onClick={() => msg.trace && setActiveTrace(msg.trace)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-left cursor-pointer"
                            title="Click to view rule evaluation trace"
                          >
                            Rule: {msg.matchedRuleName}
                          </button>
                        </>
                      )}
                      {msg.isExitMessage && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-600 font-medium">Loop break</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 pl-10">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.3s]" />
                </div>
                <span>Evaluating if-elif rules...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Loop Broken Notice */}
          {isLoopBroken && (
            <div className="flex items-center justify-between border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>The loop exited because the user said goodbye.</span>
              </div>
              <button
                onClick={handleResetSession}
                className="font-semibold text-amber-900 underline hover:text-amber-700"
              >
                Restart while loop
              </button>
            </div>
          )}

          {/* Quick Prompts row */}
          <div className="border-t border-zinc-200/80 bg-zinc-50/50 px-3 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-zinc-400 font-medium whitespace-nowrap text-[11px] pr-1">Try:</span>
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isTyping}
                  className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 text-xs font-mono whitespace-nowrap hover:bg-zinc-100 hover:border-zinc-300 transition-colors cursor-pointer"
                >
                  "{item.label}"
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="border-t border-zinc-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message (e.g. 'hello', 'how are you', 'bye')..."
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono hidden sm:inline">
                  Enter ↵
                </span>
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Trace Inspector (Side panel) */}
        {config.showTrace && (
          <div className="lg:col-span-5 h-[660px]">
            <TraceInspector trace={activeTrace} />
          </div>
        )}
      </div>
    </div>
  );
};
