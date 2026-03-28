import { useSyncExternalStore } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type ChatMessage = { id: string; role: "ai" | "user"; text: string };

export type ChatSession = {
  id: string;
  title: string;
  productBarcode?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

// ── Store ──────────────────────────────────────────────────────────────────────
let _sessions: ChatSession[] = [];
const _listeners = new Set<() => void>();

function _notify() {
  _listeners.forEach((l) => l());
}

function _subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function _snapshot(): ChatSession[] {
  return _sessions;
}

// ── Actions ────────────────────────────────────────────────────────────────────
export function createSession(title: string, productBarcode?: string): string {
  const id = `chat_${Date.now()}`;
  const greeting: ChatMessage = {
    id: "0",
    role: "ai",
    text: productBarcode
      ? `How can I assist you today? I can answer questions about ${title} — ingredients, nutrition, allergens, and more.`
      : "Hi! Ask me anything about food, nutrition, or product ingredients.",
  };
  _sessions = [
    { id, title, productBarcode, messages: [greeting], createdAt: Date.now(), updatedAt: Date.now() },
    ..._sessions,
  ];
  _notify();
  return id;
}

export function addMessage(sessionId: string, message: ChatMessage) {
  _sessions = _sessions.map((s) =>
    s.id === sessionId
      ? { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
      : s,
  );
  _notify();
}

export function getSession(id: string): ChatSession | undefined {
  return _sessions.find((s) => s.id === id);
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useChatSessions(): ChatSession[] {
  return useSyncExternalStore(_subscribe, _snapshot);
}
