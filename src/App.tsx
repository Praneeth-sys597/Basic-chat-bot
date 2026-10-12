/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ChatInterface } from './components/ChatInterface';
import { TerminalLoopSimulator } from './components/TerminalLoopSimulator';
import { RulesManager } from './components/RulesManager';
import { ConceptGuide } from './components/ConceptGuide';
import { DEFAULT_RULES } from './data/defaultRules';
import { ChatRule, ChatbotConfig } from './types/chatbot';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [rules, setRules] = useState<ChatRule[]>(DEFAULT_RULES);
  const [config, setConfig] = useState<ChatbotConfig>({
    simulatedDelayMs: 250,
    soundEnabled: true,
    showTrace: true,
    autoScroll: true,
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        setConfig={setConfig}
        ruleCount={rules.length}
      />

      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatInterface rules={rules} config={config} setConfig={setConfig} />
        )}

        {activeTab === 'terminal' && <TerminalLoopSimulator rules={rules} />}

        {activeTab === 'rules' && <RulesManager rules={rules} setRules={setRules} />}

        {activeTab === 'concepts' && <ConceptGuide rules={rules} />}
      </main>

      <footer className="border-t border-zinc-200/80 bg-white py-4 mt-auto">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-zinc-500 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-700">Task 4: Basic Rule-Based Chatbot</span>
            <span aria-hidden="true">·</span>
            <span>Input / Output</span>
            <span aria-hidden="true">·</span>
            <span>if-elif ladders</span>
            <span aria-hidden="true">·</span>
            <span>Functions</span>
            <span aria-hidden="true">·</span>
            <span>while loops</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>Deterministic Runtime</span>
            <span aria-hidden="true">·</span>
            <span>Predefined Responses</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
