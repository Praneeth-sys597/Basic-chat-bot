/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatRule } from '../types/chatbot';

export const DEFAULT_RULES: ChatRule[] = [
  {
    id: 'rule-hello',
    name: 'Greeting (Hello)',
    description: 'Replies warmly to introductory greetings',
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
    matchType: 'contains',
    responses: ['Hi!', 'Hello there!', 'Hey! Great to see you.'],
    enabled: true,
    category: 'greetings',
  },
  {
    id: 'rule-how-are-you',
    name: 'Status Inquiry (How are you)',
    description: 'Responds to questions about well-being or state',
    patterns: ['how are you', 'how are you doing', 'how is it going', 'how do you feel'],
    matchType: 'contains',
    responses: ["I'm fine, thanks!", "I'm doing well, thank you!", "All systems operational and running smoothly!"],
    enabled: true,
    category: 'status',
  },
  {
    id: 'rule-bye',
    name: 'Farewell & Exit (Bye)',
    description: 'Concludes conversation and breaks the loop',
    patterns: ['bye', 'goodbye', 'see you', 'exit', 'quit', 'cya'],
    matchType: 'contains',
    responses: ['Goodbye!', 'Bye! Have a wonderful day!', 'See you later! Take care.'],
    isExitRule: true,
    enabled: true,
    category: 'exit',
  },
  {
    id: 'rule-name',
    name: 'Identity & Purpose',
    description: 'Explains who the bot is',
    patterns: ['who are you', 'what is your name', 'whats your name', 'tell me about yourself'],
    matchType: 'contains',
    responses: [
      "I am RuleBot, an educational rule-based chatbot demonstrating conditional logic (if-elif) and functions!",
      "I'm RuleBot — built on deterministic if-elif rules, functions, and loop cycles.",
    ],
    enabled: true,
    category: 'utility',
  },
  {
    id: 'rule-help',
    name: 'Help & Commands',
    description: 'Lists available prompt ideas for testing',
    patterns: ['help', 'what can you do', 'commands', 'options'],
    matchType: 'contains',
    responses: [
      "Try asking me: 'hello', 'how are you', 'bye', 'what is your name', 'tell me a joke', or 'what time is it'.",
      "I respond to specific keyword rules! Try testing: 'hello', 'how are you', 'tell a joke', or 'bye'.",
    ],
    enabled: true,
    category: 'utility',
  },
  {
    id: 'rule-joke',
    name: 'Humor & Jokes',
    description: 'Tells simple programming and computer jokes',
    patterns: ['joke', 'tell me a joke', 'make me laugh', 'funny'],
    matchType: 'contains',
    responses: [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "There are 10 types of people in the world: those who understand binary, and those who don't.",
      "Why did the programmer quit his job? Because he didn't get arrays!",
    ],
    enabled: true,
    category: 'humor',
  },
  {
    id: 'rule-time',
    name: 'Time Query',
    description: 'Reports current system time',
    patterns: ['what time is it', 'current time', 'tell me the time', 'time now'],
    matchType: 'contains',
    responses: [
      `The current time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    ],
    enabled: true,
    category: 'utility',
  },
  {
    id: 'rule-weather',
    name: 'Weather Inquiry',
    description: 'Predefined response for weather queries',
    patterns: ['weather', 'how is the weather', 'is it raining', 'forecast'],
    matchType: 'contains',
    responses: [
      "I don't have sensors outside, but inside my CPU circuit it is always 100% sunny!",
      "Cloudy with a high chance of if-elif evaluation statements!",
    ],
    enabled: true,
    category: 'utility',
  },
];

export const FALLBACK_RESPONSES = [
  "I'm sorry, I don't recognize that command. Try saying 'hello', 'how are you', or 'bye'.",
  "No matching rule found in my if-elif ladder. Try typing 'hello' or 'help'.",
  "That input didn't match any condition in my ruleset. Type 'help' to see sample queries.",
];
