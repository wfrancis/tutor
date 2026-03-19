"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRACTICE_MODES = [
  { id: "vocab", icon: "📚", label: "Vocabulary Practice", desc: "Quiz on definitions, context clues, and sentence usage", time: "5-10 min", difficulty: 2, prompt: "Help me practice vocabulary words from my tutoring lessons. Quiz me on definitions, usage in context, and help me use them in sentences." },
  { id: "reading", icon: "📖", label: "Reading Comprehension", desc: "Passages with comprehension questions", time: "10-15 min", difficulty: 3, prompt: "Give me a short reading passage appropriate for standardized test prep and ask me comprehension questions about it. Topics can include history, science, literature, or culture." },
  { id: "literary", icon: "🎭", label: "Literary Devices", desc: "Identify metaphors, similes, imagery, and more", time: "5-10 min", difficulty: 2, prompt: "Help me practice identifying and understanding literary devices like metaphor, simile, imagery, personification, alliteration, hyperbole, and onomatopoeia. Give me examples and quiz me." },
  { id: "grammar", icon: "✍️", label: "Grammar & Writing", desc: "Sentence structure, punctuation, and word choice", time: "5-10 min", difficulty: 2, prompt: "Help me practice grammar and writing skills for standardized tests. Cover things like sentence structure, punctuation, word choice, and paragraph organization." },
  { id: "test", icon: "📝", label: "Test Prep Questions", desc: "Multiple choice in standardized test format", time: "10-15 min", difficulty: 3, prompt: "Give me practice questions in the style of standardized English tests. Include multiple choice reading comprehension, vocabulary in context, and text analysis questions." },
];

const QUICK_REPLIES = [
  "Quiz me!",
  "Explain more",
  "Next question",
  "Harder please",
  "Give me a hint",
  "I don't understand",
];

export default function PracticePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  function startMode(mode: typeof PRACTICE_MODES[0]) {
    setSelectedMode(mode.id);
    setMessages([]);
    sendMessage(mode.prompt);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  }

  // Mission select screen
  if (!selectedMode && messages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">AI Battle Arena</h1>
          <p className="text-[var(--foreground-muted)] text-sm mt-1">
            Choose your mission and challenge the AI tutor
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 stagger-children">
          {PRACTICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => startMode(mode)}
              className="card text-left hover:border-[var(--accent)] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{mode.icon}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }, (_, i) => (
                    <span
                      key={i}
                      className="text-sm"
                      style={{ color: i < mode.difficulty ? "var(--warning)" : "var(--card-border)" }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="font-extrabold text-lg mb-1 group-hover:text-[var(--accent)] transition-colors">
                {mode.label}
              </h3>
              <p className="text-sm text-[var(--foreground-muted)] mb-3">{mode.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--foreground-muted)] font-semibold">
                  ⏱ {mode.time}
                </span>
                <span className="text-sm font-extrabold text-[var(--accent)]">
                  Start Mission →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ height: "calc(100dvh - 130px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setMessages([]); setSelectedMode(null); }}
            className="btn btn-ghost btn-sm"
          >
            ← Back
          </button>
          <div>
            <h2 className="font-extrabold text-lg">
              {PRACTICE_MODES.find((m) => m.id === selectedMode)?.icon}{" "}
              {PRACTICE_MODES.find((m) => m.id === selectedMode)?.label}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          {PRACTICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => startMode(mode)}
              className={`hidden sm:block text-lg p-2 rounded-lg transition-colors ${
                selectedMode === mode.id
                  ? "bg-[var(--accent)] bg-opacity-20"
                  : "hover:bg-[rgba(255,255,255,0.06)]"
              }`}
              title={mode.label}
            >
              {mode.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl p-4 mb-4"
        style={{
          background: "var(--background-secondary)",
          border: "1px solid var(--card-border)",
        }}
      >
        {messages.filter((_, i) => i > 0 || !selectedMode).map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 mr-2 mt-1"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                }}
              >
                🤖
              </div>
            )}
            <div
              className="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
              style={
                msg.role === "user"
                  ? {
                      background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                      color: "var(--background)",
                      borderBottomRightRadius: "4px",
                    }
                  : {
                      background: "var(--card)",
                      border: "1px solid var(--card-border)",
                      borderBottomLeftRadius: "4px",
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start mb-4 animate-in">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 mr-2 mt-1"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              }}
            >
              🤖
            </div>
            <div
              className="p-4 rounded-2xl flex gap-1.5 items-center"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderBottomLeftRadius: "4px",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--foreground-muted)]" style={{ animation: "bounceIn 1.4s infinite 0s" }} />
              <span className="w-2 h-2 rounded-full bg-[var(--foreground-muted)]" style={{ animation: "bounceIn 1.4s infinite 0.2s" }} />
              <span className="w-2 h-2 rounded-full bg-[var(--foreground-muted)]" style={{ animation: "bounceIn 1.4s infinite 0.4s" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Chips */}
      {messages.length > 0 && !loading && (
        <div className="flex gap-2 mb-3 flex-wrap flex-shrink-0">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => sendMessage(reply)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground-muted)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor = "var(--accent)";
                (e.target as HTMLElement).style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = "var(--card-border)";
                (e.target as HTMLElement).style.color = "var(--foreground-muted)";
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer or ask a question..."
          disabled={loading}
          className="flex-1"
          style={{ minHeight: "48px" }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
