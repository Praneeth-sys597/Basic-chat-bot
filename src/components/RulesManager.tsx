/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, RotateCcw, Check, Sparkles, AlertCircle, Edit3, Save, X } from 'lucide-react';
import { ChatRule, MatchType } from '../types/chatbot';
import { DEFAULT_RULES } from '../data/defaultRules';
import { evaluateRules } from '../services/ruleEngine';

interface RulesManagerProps {
  rules: ChatRule[];
  setRules: React.Dispatch<React.SetStateAction<ChatRule[]>>;
}

export const RulesManager: React.FC<RulesManagerProps> = ({ rules, setRules }) => {
  const [testInput, setTestInput] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New rule form state
  const [newName, setNewName] = useState('');
  const [newPatterns, setNewPatterns] = useState('');
  const [newResponses, setNewResponses] = useState('');
  const [newMatchType, setNewMatchType] = useState<MatchType>('contains');
  const [newIsExit, setNewIsExit] = useState(false);

  // Quick live test against current rules
  const testTrace = testInput.trim() ? evaluateRules(testInput, rules) : null;

  const handleToggleEnabled = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const newRules = [...rules];
    const temp = newRules[index];
    newRules[index] = newRules[targetIndex];
    newRules[targetIndex] = temp;
    setRules(newRules);
  };

  const handleDeleteRule = (id: string) => {
    if (rules.length <= 1) {
      alert('You need at least one rule!');
      return;
    }
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetDefaults = () => {
    setRules(DEFAULT_RULES);
    setEditingRuleId(null);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPatterns.trim() || !newResponses.trim()) return;

    const parsedPatterns = newPatterns
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const parsedResponses = newResponses
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const newRule: ChatRule = {
      id: `rule-custom-${Date.now()}`,
      name: newName.trim(),
      description: 'Custom user defined condition',
      patterns: parsedPatterns,
      matchType: newMatchType,
      responses: parsedResponses,
      isExitRule: newIsExit,
      enabled: true,
      category: newIsExit ? 'exit' : 'custom',
    };

    setRules((prev) => [...prev, newRule]);
    // Reset form
    setNewName('');
    setNewPatterns('');
    setNewResponses('');
    setNewMatchType('contains');
    setNewIsExit(false);
    setShowAddForm(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Rule Manager & Testbench
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Reorder rules to understand how the sequential if-elif evaluation hierarchy works.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Rule</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
            <span>Restore Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules Table / List */}
        <div className="lg:col-span-8 space-y-3">
          {/* Add Rule Form Drawer */}
          {showAddForm && (
            <form
              onSubmit={handleAddRule}
              className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-950 uppercase tracking-wider">
                  New If-Elif Condition Rule
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Favorite Color"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-hidden focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Match Type</label>
                  <select
                    value={newMatchType}
                    onChange={(e) => setNewMatchType(e.target.value as MatchType)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="contains">Contains substring</option>
                    <option value="exact">Exact string match</option>
                    <option value="startsWith">Starts with prefix</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1 text-xs">
                  Keywords / Patterns (comma separated)
                </label>
                <input
                  type="text"
                  value={newPatterns}
                  onChange={(e) => setNewPatterns(e.target.value)}
                  placeholder="e.g. favorite color, what color do you like"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-hidden focus:border-indigo-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1 text-xs">
                  Bot Responses (one per line)
                </label>
                <textarea
                  value={newResponses}
                  onChange={(e) => setNewResponses(e.target.value)}
                  rows={2}
                  placeholder="I love electric blue and terminal green!"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-hidden focus:border-indigo-600"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsExit}
                    onChange={(e) => setNewIsExit(e.target.checked)}
                    className="rounded border-zinc-300 text-indigo-600"
                  />
                  <span>Is Exit Rule (breaks the loop like 'bye')</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  Save Rule
                </button>
              </div>
            </form>
          )}

          {/* Rule Cards */}
          <div className="space-y-2.5">
            {rules.map((rule, index) => {
              const isFirst = index === 0;
              const branchName = isFirst ? 'IF' : 'ELIF';
              return (
                <div
                  key={rule.id}
                  className={`rounded-xl border bg-white p-3.5 shadow-2xs transition-all ${
                    rule.enabled
                      ? 'border-zinc-200'
                      : 'border-zinc-200/60 bg-zinc-50/70 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Priority Tag */}
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                        #{index + 1}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          isFirst ? 'text-indigo-600' : 'text-amber-700'
                        }`}
                      >
                        {branchName}
                      </span>
                      <h3 className="text-xs font-semibold text-zinc-900">{rule.name}</h3>

                      {rule.isExitRule && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Loop Break
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggleEnabled(rule.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          rule.enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                        }`}
                        title="Enable/disable rule"
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      {/* Move up/down */}
                      <button
                        onClick={() => handleMoveRule(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                        title="Move higher in if-elif ladder"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveRule(index, 'down')}
                        disabled={index === rules.length - 1}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                        title="Move lower in if-elif ladder"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 rounded text-zinc-400 hover:text-red-600 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Patterns */}
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px]">
                    <span className="text-zinc-400 font-sans">Patterns ({rule.matchType}):</span>
                    {rule.patterns.map((p, pIdx) => (
                      <code
                        key={pIdx}
                        className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-mono"
                      >
                        "{p}"
                      </code>
                    ))}
                  </div>

                  {/* Reply */}
                  <div className="mt-2 text-[11px] text-zinc-600">
                    <span className="text-zinc-400">Response: </span>
                    <span className="font-sans font-medium text-zinc-800">
                      "{rule.responses[0]}"
                      {rule.responses.length > 1 && (
                        <span className="text-zinc-400 font-normal ml-1">
                          (+{rule.responses.length - 1} alternative)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Testbench Scratchpad */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs sticky top-20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
                Rule Testbench Scratchpad
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Type any test sentence below to immediately see which if-elif branch matches first!
            </p>

            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="e.g. 'hello!', 'how are you', 'bye'..."
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-900 font-mono"
            />

            {/* Quick quick inputs */}
            <div className="flex flex-wrap gap-1 mt-2">
              {['hello', 'how are you', 'bye', 'unknown phrase'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTestInput(t)}
                  className="text-[10px] font-mono text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded transition-colors"
                >
                  "{t}"
                </button>
              ))}
            </div>

            {/* Match output card */}
            <div className="mt-4 pt-4 border-t border-zinc-100">
              {testTrace ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Result:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] font-mono ${
                        testTrace.branchTaken === 'else'
                          ? 'bg-zinc-100 text-zinc-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {testTrace.branchTaken.toUpperCase()} BRANCH
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-2.5 text-xs border border-zinc-200 font-mono">
                    <div className="text-[11px] text-zinc-500 mb-1">Matched Rule:</div>
                    <div className="font-semibold text-zinc-900">
                      {testTrace.matchedRule?.name || 'Fallback Else'}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-2 mb-1">Bot Would Say:</div>
                    <div className="text-indigo-600 font-sans font-medium">
                      "{testTrace.chosenResponse}"
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Evaluated {testTrace.steps.length} conditions in {testTrace.executionTimeMs} ms.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 text-center py-4">
                  Enter text above to preview rule matches.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
