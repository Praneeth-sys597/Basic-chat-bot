/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, RotateCcw, CornerDownLeft, Sparkles, Check, Copy } from 'lucide-react';
import { ChatRule } from '../types/chatbot';
import { evaluateRules } from '../services/ruleEngine';

interface TerminalLoopSimulatorProps {
  rules: ChatRule[];
}

interface TerminalLogEntry {
  type: 'system' | 'user' | 'bot' | 'eval';
  text: string;
  step?: string;
}

export const TerminalLoopSimulator: React.FC<TerminalLoopSimulatorProps> = ({ rules }) => {
  const [iteration, setIteration] = useState(1);
  const [isTerminated, setIsTerminated] = useState(false);
  const [cliInput, setCliInput] = useState('');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState(false);

  const [logs, setLogs] = useState<TerminalLogEntry[]>([
    { type: 'system', text: '>>> Python 3.12.0 (main) [Clang 16.0.0]' },
    { type: 'system', text: '>>> Running: python chatbot_loop.py' },
    { type: 'system', text: '==================================================' },
    { type: 'system', text: 'RuleBot Online! Type "bye" to exit the while-loop.' },
    { type: 'system', text: '==================================================' },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (cmdText?: string) => {
    const text = (cmdText !== undefined ? cmdText : cliInput).trim();
    if (!text || isTerminated) return;

    setActiveStep(2); // input() received

    const newLogs: TerminalLogEntry[] = [
      ...logs,
      { type: 'user', text: `[Loop #${iteration}] You: ${text}` },
    ];

    // Evaluate
    setActiveStep(3); // function call get_response()
    const trace = evaluateRules(text, rules);

    if (trace.isExit) {
      newLogs.push({
        type: 'bot',
        text: `Bot: ${trace.chosenResponse}`,
      });
      newLogs.push({
        type: 'system',
        text: `[Loop #${iteration}] Condition matched exit rule ('${trace.matchedRule?.name}').`,
      });
      newLogs.push({
        type: 'system',
        text: `>>> 'break' statement executed. While-loop terminated after ${iteration} iteration(s).`,
      });
      setActiveStep(5); // break
      setIsTerminated(true);
    } else {
      newLogs.push({
        type: 'eval',
        text: `↳ Evaluated: ${trace.branchTaken.toUpperCase()} branch -> matched '${trace.matchedRule?.name || 'Fallback Else'}'`,
      });
      newLogs.push({
        type: 'bot',
        text: `Bot: ${trace.chosenResponse}`,
      });
      setActiveStep(4); // print()
      setIteration((prev) => prev + 1);
    }

    setLogs(newLogs);
    setCliInput('');
  };

  const handleRestart = () => {
    setIteration(1);
    setIsTerminated(false);
    setActiveStep(1);
    setLogs([
      { type: 'system', text: '>>> Loop reset.' },
      { type: 'system', text: '==================================================' },
      { type: 'system', text: 'RuleBot Online! Type "bye" to exit the while-loop.' },
      { type: 'system', text: '==================================================' },
    ]);
    inputRef.current?.focus();
  };

  const pythonLoopSnippet = `def run_chat_loop():
    # LOOP CONCEPT: Continuous execution cycle
    while True:
        # 1. INPUT CONCEPT
        user_message = input("You: ")

        # 2. EXIT CONDITION (break)
        if user_message.lower().strip() == "bye":
            print("Bot: Goodbye!")
            break  # Exits while loop

        # 3. FUNCTION & IF-ELIF CONCEPT
        response = get_chatbot_reply(user_message)

        # 4. OUTPUT CONCEPT
        print(f"Bot: {response}")`;

  const copyCode = () => {
    navigator.clipboard.writeText(pythonLoopSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Python Interactive CLI & While-Loop Simulator
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Explore how the 4 key concepts (loops, functions, if-elif, and input/output) interact in a real runtime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Screen */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono shadow-lg overflow-hidden h-[620px]">
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-zinc-900/90 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 font-mono text-zinc-400 text-[11px]">
                bash: python chatbot_loop.py
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-400">
                Loop Iteration: <strong className="text-emerald-400">{iteration}</strong>
              </span>
              <button
                onClick={handleRestart}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                title="Restart loop"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restart</span>
              </button>
            </div>
          </div>

          {/* Terminal Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
            {logs.map((log, i) => {
              if (log.type === 'system') {
                return (
                  <div key={i} className="text-zinc-500">
                    {log.text}
                  </div>
                );
              }
              if (log.type === 'user') {
                return (
                  <div key={i} className="text-sky-300 font-semibold">
                    {log.text}
                  </div>
                );
              }
              if (log.type === 'eval') {
                return (
                  <div key={i} className="text-indigo-400/80 text-[11px] pl-4">
                    {log.text}
                  </div>
                );
              }
              return (
                <div key={i} className="text-emerald-300 font-semibold pl-2">
                  {log.text}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="border-t border-zinc-800/80 bg-zinc-900/60 px-4 py-2 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-zinc-400 shrink-0">Sample inputs:</span>
            {['hello', 'how are you', 'what is your name', 'bye'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleCommand(cmd)}
                disabled={isTerminated}
                className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Terminal Input Prompt */}
          <div className="border-t border-zinc-800 bg-zinc-900 p-3">
            {isTerminated ? (
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span>[Process finished with exit code 0]</span>
                <button
                  onClick={handleRestart}
                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-medium"
                >
                  Start New Loop
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold select-none">&gt;&gt;&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCommand();
                    }
                  }}
                  placeholder="input('You: ') ... type 'hello', 'how are you', or 'bye'"
                  className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden font-mono text-xs"
                  autoFocus
                />
                <button
                  onClick={() => handleCommand()}
                  disabled={!cliInput.trim()}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono disabled:opacity-40"
                >
                  Send ↵
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Code & Step-by-Step Logic Explanation */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Loop Mechanics Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-900">Python while-loop Mechanics</h2>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="rounded-lg bg-zinc-950 p-3.5 text-zinc-200 font-mono text-[11px] leading-relaxed overflow-x-auto">
              <code>{pythonLoopSnippet}</code>
            </pre>
          </div>

          {/* Concept Execution Steps */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs flex-1">
            <h2 className="text-sm font-semibold text-zinc-900 mb-3">Runtime Flow in This Iteration</h2>
            <div className="space-y-3 text-xs">
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  activeStep === 1
                    ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <div className="font-semibold text-zinc-900">1. Event Loop Active (`while True:`)</div>
                <p className="text-zinc-600 mt-0.5 text-[11px]">
                  The program repeats the cycle without terminating until a `break` statement executes.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  activeStep === 2
                    ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <div className="font-semibold text-zinc-900">2. Input Capture (`user_message = input(...)`)</div>
                <p className="text-zinc-600 mt-0.5 text-[11px]">
                  Halts execution waiting for terminal standard input, then converts to a string.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  activeStep === 3
                    ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <div className="font-semibold text-zinc-900">3. Function & If-Elif Evaluation</div>
                <p className="text-zinc-600 mt-0.5 text-[11px]">
                  Calls `get_chatbot_reply(user_message)` which checks if condition branches in order.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  activeStep === 4
                    ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <div className="font-semibold text-zinc-900">4. Output Presentation (`print(...)`)</div>
                <p className="text-zinc-600 mt-0.5 text-[11px]">
                  Prints the return value to standard output, completing iteration #{iteration}.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  activeStep === 5
                    ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-200'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <div className="font-semibold text-amber-900">5. Loop Exit Condition (`break`)</div>
                <p className="text-zinc-600 mt-0.5 text-[11px]">
                  When user inputs "bye", the condition matches and triggers `break` to stop the loop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
