/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MatchType = 'exact' | 'contains' | 'startsWith' | 'regex';

export interface ChatRule {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  matchType: MatchType;
  responses: string[];
  isExitRule?: boolean;
  enabled: boolean;
  category: 'greetings' | 'status' | 'exit' | 'utility' | 'humor' | 'custom';
}

export interface TraceStep {
  ruleId: string;
  ruleName: string;
  branchType: 'if' | 'elif' | 'else';
  evaluatedCondition: string;
  matched: boolean;
  explanation: string;
}

export interface RuleEvalTrace {
  timestamp: string;
  rawInput: string;
  normalizedInput: string;
  steps: TraceStep[];
  matchedRule?: ChatRule;
  chosenResponse: string;
  branchTaken: 'if' | 'elif' | 'else';
  isExit: boolean;
  executionTimeMs: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  matchedRuleId?: string;
  matchedRuleName?: string;
  isExitMessage?: boolean;
  trace?: RuleEvalTrace;
}

export interface ChatbotConfig {
  simulatedDelayMs: number; // 0, 300, 700
  soundEnabled: boolean;
  showTrace: boolean;
  autoScroll: boolean;
}
