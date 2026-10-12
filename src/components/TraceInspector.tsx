/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RuleEvalTrace } from '../types/chatbot';
import { CheckCircle2, XCircle, ArrowRight, CornerDownRight, Cpu, Layers } from 'lucide-react';

interface TraceInspectorProps {
  trace: RuleEvalTrace | null;
  onClose?: () => void;
}

export const TraceInspector: React.FC<TraceInspectorProps> = ({ trace, onClose }) => {
  if (!trace) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl h-full bg-zinc-50/50">
        <Cpu className="h-8 w-8 text-zinc-300 mb-2" />
        <p className="text-sm font-medium text-zinc-600">No Execution Trace Yet</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
          Send a message in the chat to see the step-by-step if-elif ladder evaluation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 bg-zinc-50/80">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Execution Logic Trace
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{trace.executionTimeMs} ms</span>
          <span aria-hidden="true">·</span>
          <span>{trace.steps.length} conditions checked</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 ml-1 text-sm font-bold"
              aria-label="Close trace inspector"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
        {/* Step 1: Input Preprocessing */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
          <div className="flex items-center justify-between text-zinc-500 mb-1.5 font-sans font-medium text-xs">
            <span>[1] Input Processing Function</span>
            <span className="text-zinc-400">normalize_input()</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-zinc-500">Raw:</span>
            <span className="text-zinc-900 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
              "{trace.rawInput}"
            </span>
            <ArrowRight className="h-3 w-3 text-zinc-400" />
            <span className="text-zinc-500">Cleaned:</span>
            <span className="text-indigo-600 font-semibold bg-indigo-50/70 px-1.5 py-0.5 rounded border border-indigo-100">
              "{trace.normalizedInput}"
            </span>
          </div>
        </div>

        {/* Step 2: if-elif Evaluation Chain */}
        <div>
          <div className="flex items-center justify-between font-sans text-xs font-medium text-zinc-500 mb-2">
            <span>[2] Sequential If-Elif Condition Ladder</span>
            <span className="text-zinc-400">Short-circuit evaluation</span>
          </div>

          <div className="space-y-1.5">
            {trace.steps.map((step, idx) => {
              const isMatch = step.matched;
              return (
                <div
                  key={`${step.ruleId}-${idx}`}
                  className={`rounded-lg p-2.5 border transition-all ${
                    isMatch
                      ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-zinc-50/60 border-zinc-200/80 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {isMatch ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      )}
                      <span
                        className={`font-semibold uppercase tracking-tight text-[11px] ${
                          step.branchType === 'if'
                            ? 'text-indigo-600'
                            : step.branchType === 'elif'
                            ? 'text-amber-700'
                            : 'text-zinc-600'
                        }`}
                      >
                        {step.branchType}
                      </span>
                      <span className="text-zinc-800 font-medium truncate">{step.ruleName}</span>
                    </div>

                    <span
                      className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded ${
                        isMatch
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {isMatch ? 'MATCHED (TRUE)' : 'FALSE'}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-zinc-600 font-mono break-all">
                    {step.evaluatedCondition}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
                    <CornerDownRight className="h-3 w-3 text-zinc-400" />
                    <span>{step.explanation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Branch Result & Output */}
        <div className="rounded-lg bg-indigo-50/70 border border-indigo-200 p-3">
          <div className="flex items-center justify-between font-sans text-xs font-medium text-indigo-900 mb-1.5">
            <span>[3] Output Function Return</span>
            <span className="text-indigo-700 font-mono text-[11px]">
              Branch: {trace.branchTaken.toUpperCase()}
            </span>
          </div>

          <div className="rounded bg-white p-2 border border-indigo-100 text-zinc-800 font-sans text-xs">
            <span className="text-zinc-500 font-mono">return </span>
            <span className="font-semibold text-zinc-900">"{trace.chosenResponse}"</span>
          </div>

          {trace.isExit && (
            <div className="mt-2 text-[11px] font-sans text-amber-800 bg-amber-50 rounded p-1.5 border border-amber-200">
              ⚠️ Loop Break Triggered: This matched rule signals termination of the while-loop.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
