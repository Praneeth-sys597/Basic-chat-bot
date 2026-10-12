/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Code2, Copy, Check, Terminal, Play, GitBranch, ArrowRight } from 'lucide-react';
import { ChatRule } from '../types/chatbot';
import { generatePythonCode, generateJavaScriptCode } from '../services/ruleEngine';

interface ConceptGuideProps {
  rules: ChatRule[];
}

export const ConceptGuide: React.FC<ConceptGuideProps> = ({ rules }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript'>('python');
  const [copied, setCopied] = useState(false);
  const [activeConcept, setActiveConcept] = useState<'if-elif' | 'functions' | 'loops' | 'io'>('if-elif');

  const pythonCode = generatePythonCode(rules);
  const jsCode = generateJavaScriptCode(rules);

  const activeCode = selectedLanguage === 'python' ? pythonCode : jsCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Core Programming Concepts Guide
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Deep-dive into the four fundamental building blocks powering rule-based chatbots.
        </p>
      </div>

      {/* 4 Concepts Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Concept 1: if-elif */}
        <button
          onClick={() => setActiveConcept('if-elif')}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            activeConcept === 'if-elif'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs font-bold text-indigo-600">01. if-elif-else</span>
            <GitBranch className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xs font-semibold text-zinc-900">Conditional Ladders</div>
          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
            Evaluates tests sequentially from top to bottom; stops at first match.
          </p>
        </button>

        {/* Concept 2: Functions */}
        <button
          onClick={() => setActiveConcept('functions')}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            activeConcept === 'functions'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs font-bold text-indigo-600">02. Functions</span>
            <Code2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xs font-semibold text-zinc-900">Logic Modularization</div>
          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
            `def get_reply(input):` isolates pattern matching and returns text.
          </p>
        </button>

        {/* Concept 3: Loops */}
        <button
          onClick={() => setActiveConcept('loops')}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            activeConcept === 'loops'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs font-bold text-indigo-600">03. Event Loops</span>
            <Terminal className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xs font-semibold text-zinc-900">while True & break</div>
          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
            Keeps the conversation alive indefinitely until exit word triggers break.
          </p>
        </button>

        {/* Concept 4: Input / Output */}
        <button
          onClick={() => setActiveConcept('io')}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            activeConcept === 'io'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs font-bold text-indigo-600">04. Input / Output</span>
            <ArrowRight className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xs font-semibold text-zinc-900">input() & print()</div>
          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
            Receives strings from the user, normalizes casing, and renders output.
          </p>
        </button>
      </div>

      {/* Concept Explanation Card */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        {activeConcept === 'if-elif' && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 mb-2">
              Concept 1: The if-elif-else Ladder (Branching Logic)
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed mb-3">
              In a rule-based chatbot, decision making relies on sequential condition statements.
              Python evaluates the top <code className="text-indigo-600 font-mono">if</code> first. If false, it proceeds
              to the next <code className="text-indigo-600 font-mono">elif</code> (else if). The first condition that
              evaluates to <strong className="text-zinc-900">True</strong> executes its block and immediately halts
              subsequent checks (short-circuiting).
            </p>
            <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 text-xs font-mono space-y-1 text-zinc-800">
              <p className="text-indigo-600 font-semibold">if user_input == "hello":</p>
              <p className="pl-4 text-zinc-600">return "Hi!"</p>
              <p className="text-amber-700 font-semibold">elif "how are you" in user_input:</p>
              <p className="pl-4 text-zinc-600">return "I'm fine, thanks!"</p>
              <p className="text-amber-700 font-semibold">elif user_input == "bye":</p>
              <p className="pl-4 text-zinc-600">return "Goodbye!"</p>
              <p className="text-zinc-600 font-semibold">else:</p>
              <p className="pl-4 text-zinc-600">return "I don't understand."</p>
            </div>
          </div>
        )}

        {activeConcept === 'functions' && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 mb-2">
              Concept 2: Functions (Separation of Concerns)
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed mb-3">
              Functions bundle repeatable tasks into discrete, testable units. Instead of putting all
              if-elif logic directly inside the main loop, we isolate it into a pure function
              <code className="text-indigo-600 font-mono ml-1">get_chatbot_reply(user_input)</code>. This makes it
              easy to unit test, reuse in different user interfaces, and maintain.
            </p>
            <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 text-xs font-mono space-y-1 text-zinc-800">
              <p className="text-indigo-600 font-semibold">def normalize_input(text: str) -&gt; str:</p>
              <p className="pl-4 text-zinc-500"># Cleans, trims, and lowercases text</p>
              <p className="pl-4 text-zinc-600">return text.strip().lower()</p>
              <p className="text-indigo-600 font-semibold mt-2">def get_chatbot_reply(text: str) -&gt; str:</p>
              <p className="pl-4 text-zinc-500"># Pure function mapping string input to predefined output</p>
              <p className="pl-4 text-zinc-600">...</p>
            </div>
          </div>
        )}

        {activeConcept === 'loops' && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 mb-2">
              Concept 3: Event Loops (Continuous Interaction)
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed mb-3">
              A console application exits as soon as its script reaches the bottom. To keep a chat
              conversation interactive, we wrap the prompt in an infinite loop
              <code className="text-indigo-600 font-mono ml-1">while True:</code>. The loop repeatedly pauses for user input,
              evaluates it, and outputs a response. When the user types an exit command (like "bye"),
              a <code className="text-amber-700 font-mono font-semibold">break</code> statement terminates the loop.
            </p>
            <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 text-xs font-mono space-y-1 text-zinc-800">
              <p className="text-indigo-600 font-semibold">while True:</p>
              <p className="pl-4 text-zinc-600">message = input("You: ")</p>
              <p className="pl-4 text-amber-700 font-semibold">if message == "bye":</p>
              <p className="pl-8 text-zinc-600">print("Bot: Goodbye!")</p>
              <p className="pl-8 text-amber-700 font-semibold">break  # &lt;-- Exits loop gracefully</p>
              <p className="pl-4 text-zinc-600">print(f"Bot: &#123;get_reply(message)&#125;")</p>
            </div>
          </div>
        )}

        {activeConcept === 'io' && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 mb-2">
              Concept 4: Input / Output (I/O & Data Normalization)
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed mb-3">
              In Python, <code className="text-indigo-600 font-mono">input()</code> halts execution and reads a line
              from standard input, while <code className="text-indigo-600 font-mono">print()</code> writes characters to
              standard output. Because users may type capital letters or extra spaces (e.g. <code className="font-mono">" HELLO! "</code>),
              input normalization (<code className="font-mono">.lower().strip()</code>) is critical before comparing strings.
            </p>
            <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 text-xs font-mono space-y-1 text-zinc-800">
              <p className="text-zinc-500"># 1. Standard Input</p>
              <p className="text-indigo-600">raw_user_input = input("You: ")</p>
              <p className="text-zinc-500 mt-1"># 2. String Normalization</p>
              <p className="text-indigo-600">cleaned = raw_user_input.strip().lower()</p>
              <p className="text-zinc-500 mt-1"># 3. Standard Output</p>
              <p className="text-indigo-600">print(f"Bot: &#123;reply&#125;")</p>
            </div>
          </div>
        )}
      </div>

      {/* Code Viewer */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-950 overflow-hidden shadow-md">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-lg">
              <button
                onClick={() => setSelectedLanguage('python')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedLanguage === 'python'
                    ? 'bg-zinc-700 text-white shadow-2xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Python (.py)
              </button>
              <button
                onClick={() => setSelectedLanguage('javascript')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedLanguage === 'javascript'
                    ? 'bg-zinc-700 text-white shadow-2xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                JavaScript (.js)
              </button>
            </div>
            <span className="text-xs text-zinc-400 hidden sm:inline">
              Autogenerated based on active rules
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-zinc-200 leading-relaxed">
            <code>{activeCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
