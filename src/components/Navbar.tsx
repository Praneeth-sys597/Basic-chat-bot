/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bot, Terminal, Sliders, BookOpen, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { ChatbotConfig } from '../types/chatbot';

export type ActiveTab = 'chat' | 'terminal' | 'rules' | 'concepts';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  config: ChatbotConfig;
  setConfig: React.Dispatch<React.SetStateAction<ChatbotConfig>>;
  ruleCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  setConfig,
  ruleCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-zinc-900">RuleBot</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Deterministic Engine
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Rule-based Chatbot · if-elif · Functions · Loops · I/O
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 border border-zinc-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Chat Room</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'terminal'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Python CLI Loop</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'rules'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Rules ({ruleCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('concepts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'concepts'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Code & Concepts</span>
          </button>
        </nav>

        {/* Utility controls */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              config.soundEnabled
                ? 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                : 'border-zinc-200 text-zinc-400 hover:bg-zinc-50'
            }`}
            title={config.soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
            aria-label={config.soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {config.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Trace toggle */}
          <button
            onClick={() => setConfig((prev) => ({ ...prev, showTrace: !prev.showTrace }))}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              config.showTrace
                ? 'border-indigo-200 bg-indigo-50/60 text-indigo-700'
                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
            title="Toggle if-elif execution tracer inspector"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Logic Trace {config.showTrace ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
