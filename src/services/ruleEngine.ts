/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatRule, RuleEvalTrace, TraceStep } from '../types/chatbot';
import { FALLBACK_RESPONSES } from '../data/defaultRules';

/**
 * Step 1 (Input Concept): Normalize user input for robust comparison
 * e.g., "  Hello! " -> "hello"
 */
export function normalizeInput(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if normalized input satisfies the rule based on its match type
 */
function testRuleMatch(normalizedInput: string, rule: ChatRule): { matched: boolean; matchedPattern?: string; reason: string } {
  if (!rule.enabled) {
    return { matched: false, reason: 'Rule is currently disabled' };
  }

  for (const pattern of rule.patterns) {
    const normPattern = normalizeInput(pattern);
    if (!normPattern) continue;

    switch (rule.matchType) {
      case 'exact': {
        if (normalizedInput === normPattern) {
          return {
            matched: true,
            matchedPattern: pattern,
            reason: `Exact match: "${normalizedInput}" === "${normPattern}"`,
          };
        }
        break;
      }
      case 'startsWith': {
        if (normalizedInput.startsWith(normPattern)) {
          return {
            matched: true,
            matchedPattern: pattern,
            reason: `Starts with "${normPattern}"`,
          };
        }
        break;
      }
      case 'regex': {
        try {
          const reg = new RegExp(pattern, 'i');
          if (reg.test(normalizedInput)) {
            return {
              matched: true,
              matchedPattern: pattern,
              reason: `Regex /${pattern}/i matched`,
            };
          }
        } catch {
          // ignore invalid regex
        }
        break;
      }
      case 'contains':
      default: {
        // Look for phrase or word inclusion
        const paddedInput = ` ${normalizedInput} `;
        const paddedPattern = ` ${normPattern} `;
        if (normalizedInput.includes(normPattern) || paddedInput.includes(paddedPattern)) {
          return {
            matched: true,
            matchedPattern: pattern,
            reason: `Contains substring "${normPattern}"`,
          };
        }
        break;
      }
    }
  }

  return {
    matched: false,
    reason: `Checked ${rule.patterns.length} pattern(s), none matched "${normalizedInput}"`,
  };
}

/**
 * Step 2 & 3 (Functions & If-Elif-Else Concept):
 * Evaluates the rules in order (if -> elif -> elif -> else)
 * and generates a transparent execution trace.
 */
export function evaluateRules(rawInput: string, rules: ChatRule[]): RuleEvalTrace {
  const startTime = performance.now();
  const normalizedInput = normalizeInput(rawInput);
  const steps: TraceStep[] = [];

  let matchedRule: ChatRule | undefined;
  let chosenResponse = '';
  let branchTaken: 'if' | 'elif' | 'else' = 'else';
  let isExit = false;

  let activeIndex = 0;
  for (const rule of rules) {
    if (!rule.enabled) continue;

    const branchType: 'if' | 'elif' = activeIndex === 0 ? 'if' : 'elif';
    const testResult = testRuleMatch(normalizedInput, rule);

    const conditionLabel = rule.patterns.map((p) => `"${p}"`).join(' or ');

    steps.push({
      ruleId: rule.id,
      ruleName: rule.name,
      branchType,
      evaluatedCondition: `${branchType} user_input matches [${conditionLabel}]`,
      matched: testResult.matched,
      explanation: testResult.reason,
    });

    if (testResult.matched) {
      matchedRule = rule;
      branchTaken = branchType;
      // Pick response (deterministic for first match, or random among choices)
      const options = rule.responses.length > 0 ? rule.responses : ['OK!'];
      chosenResponse = options[Math.floor(Math.random() * options.length)];
      isExit = Boolean(rule.isExitRule);
      break; // Short-circuit evaluation (classic if-elif behavior!)
    }

    activeIndex++;
  }

  // If no rule matched, execute 'else' fallback branch
  if (!matchedRule) {
    branchTaken = 'else';
    steps.push({
      ruleId: 'fallback-else',
      ruleName: 'Fallback Default',
      branchType: 'else',
      evaluatedCondition: 'else (no previous rule matched)',
      matched: true,
      explanation: 'Executed default response handler',
    });
    chosenResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }

  const durationMs = Number((performance.now() - startTime).toFixed(2));

  return {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawInput,
    normalizedInput,
    steps,
    matchedRule,
    chosenResponse,
    branchTaken,
    isExit,
    executionTimeMs: durationMs,
  };
}

/**
 * Synthesizes sound feedback using Web Audio API (no external asset downloads)
 */
export function playChime(type: 'send' | 'reply' | 'exit'): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'send') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'reply') {
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'exit') {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.2);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // Audio context may be restricted in some browser policies
  }
}

/**
 * Generates runnable, canonical Python code reflecting current active rules
 */
export function generatePythonCode(rules: ChatRule[]): string {
  const activeRules = rules.filter((r) => r.enabled);

  const ifElifLines = activeRules
    .map((rule, idx) => {
      const kw = idx === 0 ? 'if' : 'elif';
      const patternsFormatted = JSON.stringify(rule.patterns.map((p) => p.toLowerCase()));
      const reply = rule.responses[0] || 'OK';

      let condition = '';
      if (rule.matchType === 'exact') {
        condition = `cleaned_text in ${patternsFormatted}:`;
      } else {
        condition = `any(pat in cleaned_text for pat in ${patternsFormatted}):`;
      }

      const exitComment = rule.isExitRule ? '  # Triggers break in the while loop' : '';

      return `    # Rule: ${rule.name}
    ${kw} ${condition}
        return "${reply.replace(/"/g, '\\"')}"${exitComment}`;
    })
    .join('\n\n');

  return `# ==============================================================
# RULE-BASED CHATBOT (Python Implementation)
# Demonstrates: if-elif ladder, functions, while loop, and input/output
# ==============================================================

def normalize_input(text: str) -> str:
    """Preprocesses user input by trimming, lowercasing, and removing punctuation."""
    import re
    cleaned = text.strip().lower()
    cleaned = re.sub(r'[.,/#!$%^&*;:{}=\\-_'~()?]\\s*', ' ', cleaned)
    return " ".join(cleaned.split())


def get_chatbot_reply(user_input: str) -> str:
    """
    Function implementing the if-elif-else rule ladder.
    Returns the appropriate predefined response string.
    """
    cleaned_text = normalize_input(user_input)

${ifElifLines || '    # No custom rules defined'}
    else:
        return "I'm sorry, I don't understand that yet. Try saying 'hello', 'how are you', or 'bye'."


def run_chatbot_session():
    """
    Main interactive loop: input/output cycle running in a while loop
    until an exit condition is met.
    """
    print("=" * 50)
    print("🤖 RuleBot Online! (Type 'bye' to quit)")
    print("=" * 50)

    # LOOP CONCEPT: Event loop continuously accepting input
    while True:
        # INPUT CONCEPT: Read user message from terminal
        user_message = input("You: ")

        # EXIT CHECK: Break out of loop if user says goodbye
        cleaned = normalize_input(user_message)
        if any(exit_word in cleaned for exit_word in ["bye", "goodbye", "exit", "quit"]):
            print("Bot: Goodbye!")
            print("[Event Loop Terminated]")
            break

        # FUNCTION CALL: Evaluate rules and retrieve response
        response = get_chatbot_reply(user_message)

        # OUTPUT CONCEPT: Print response to user
        print(f"Bot: {response}\\n")


if __name__ == "__main__":
    run_chatbot_session()
`;
}

/**
 * Generates runnable JavaScript/TypeScript code reflecting current active rules
 */
export function generateJavaScriptCode(rules: ChatRule[]): string {
  const activeRules = rules.filter((r) => r.enabled);

  const ifElifLines = activeRules
    .map((rule, idx) => {
      const kw = idx === 0 ? 'if' : 'else if';
      const patternsFormatted = JSON.stringify(rule.patterns.map((p) => p.toLowerCase()));
      const reply = rule.responses[0] || 'OK';

      let condition = '';
      if (rule.matchType === 'exact') {
        condition = `${patternsFormatted}.includes(cleaned)`;
      } else {
        condition = `${patternsFormatted}.some(pat => cleaned.includes(pat))`;
      }

      return `  // ${rule.name}
  ${kw} (${condition}) {
    return "${reply.replace(/"/g, '\\"')}";
  }`;
    })
    .join('\n\n');

  return `// ==============================================================
// RULE-BASED CHATBOT (JavaScript / Node.js Implementation)
// ==============================================================

function cleanInput(text) {
  return text.trim().toLowerCase().replace(/[^a-zA-Z0-9 ]/g, " ").trim();
}

// FUNCTION CONCEPT: Rule-evaluation logic
function getChatbotReply(userInput) {
  const cleaned = cleanInput(userInput);

${ifElifLines}
  else {
    return "I'm sorry, I don't understand that yet. Try saying 'hello', 'how are you', or 'bye'.";
  }
}

// LOOP & INPUT/OUTPUT: Node.js readline loop
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 RuleBot Online! (Type 'bye' to quit)");

function chatLoop() {
  readline.question("You: ", (input) => {
    const cleaned = cleanInput(input);
    if (["bye", "goodbye", "exit"].some(w => cleaned.includes(w))) {
      console.log("Bot: Goodbye!");
      readline.close();
      return;
    }

    const reply = getChatbotReply(input);
    console.log("Bot: " + reply + "\\n");
    chatLoop(); // Recursive event loop
  });
}

chatLoop();
`;
}
