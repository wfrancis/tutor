"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRACTICE_MODES = [
  {
    id: "vocab",
    icon: "\uD83D\uDCDA",
    label: "Vocabulary Practice",
    description: "Master new words, definitions, and usage in context",
    difficulty: "Medium",
    time: "10 min",
    color: "#00d4aa",
    prompt:
      "Help me practice vocabulary words from my tutoring lessons. Quiz me on definitions, usage in context, and help me use them in sentences.",
  },
  {
    id: "reading",
    icon: "\uD83D\uDCD6",
    label: "Reading Comprehension",
    description: "Practice understanding passages and answering questions",
    difficulty: "Medium",
    time: "15 min",
    color: "#1e3a5f",
    prompt:
      "Give me a short reading passage appropriate for standardized test prep and ask me comprehension questions about it. Topics can include history, science, literature, or culture.",
  },
  {
    id: "literary",
    icon: "\uD83C\uDFAD",
    label: "Literary Devices",
    description: "Identify metaphors, similes, imagery, and more",
    difficulty: "Hard",
    time: "10 min",
    color: "#ff6b35",
    prompt:
      "Help me practice identifying and understanding literary devices like metaphor, simile, imagery, personification, alliteration, hyperbole, and onomatopoeia. Give me examples and quiz me.",
  },
  {
    id: "grammar",
    icon: "\u270D\uFE0F",
    label: "Grammar & Writing",
    description: "Sharpen sentence structure, punctuation, and word choice",
    difficulty: "Medium",
    time: "10 min",
    color: "#7c3aed",
    prompt:
      "Help me practice grammar and writing skills for standardized tests. Cover things like sentence structure, punctuation, word choice, and paragraph organization.",
  },
  {
    id: "test",
    icon: "\uD83D\uDCDD",
    label: "Test Prep Questions",
    description: "Simulate real standardized test questions",
    difficulty: "Hard",
    time: "20 min",
    color: "#dc2626",
    prompt:
      "Give me practice questions in the style of standardized English tests. Include multiple choice reading comprehension, vocabulary in context, and text analysis questions.",
  },
];

const QUICK_REPLIES = [
  "Quiz me!",
  "Explain more",
  "Next question",
  "Harder please",
  "Give me a hint",
  "I don't understand",
];

const DIFFICULTY_DOTS: Record<string, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export default function PracticePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(content: string, resetMessages?: boolean) {
    const userMessage: Message = { role: "user", content };
    const baseMessages = resetMessages ? [] : messages;
    const newMessages = [...baseMessages, userMessage];
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
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function startMode(mode: (typeof PRACTICE_MODES)[0]) {
    setSelectedMode(mode.id);
    sendMessage(mode.prompt, true);
  }

  function clearChat() {
    setMessages([]);
    setSelectedMode(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  }

  const currentMode = PRACTICE_MODES.find((m) => m.id === selectedMode);
  const showModeSelector = !selectedMode && messages.length === 0;

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}
      className="flex flex-col"
    >
      {/* ─── Mode Selection Screen ─── */}
      {showModeSelector && (
        <div className="max-w-4xl mx-auto px-4 py-8 w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ backgroundColor: "#1e3a5f", color: "#00d4aa" }}
            >
              <span>&#9889;</span> AI-Powered Practice
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
              style={{ color: "#1e3a5f" }}
            >
              Choose Your Mission
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              Pick a practice mode and chat with your AI tutor
            </p>
          </div>

          {/* Mode cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRACTICE_MODES.map((mode) => {
              const dots = DIFFICULTY_DOTS[mode.difficulty] || 2;
              return (
                <button
                  key={mode.id}
                  onClick={() => startMode(mode)}
                  className="text-left rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden"
                  style={{
                    backgroundColor: "white",
                    border: "2px solid #e2e8f0",
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${mode.color}10, transparent 70%)`,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md transition-transform group-hover:scale-110 relative"
                    style={{
                      background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`,
                    }}
                  >
                    {mode.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base mb-1.5 relative" style={{ color: "#1e3a5f" }}>
                    {mode.label}
                  </h3>

                  {/* Description */}
                  <p className="text-xs leading-relaxed mb-4 relative" style={{ color: "#64748b" }}>
                    {mode.description}
                  </p>

                  {/* Bottom meta */}
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold" style={{ color: "#64748b" }}>
                        Difficulty
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: i < dots ? mode.color : "#e2e8f0",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
                    >
                      ~{mode.time}
                    </span>
                  </div>

                  {/* Play hint on hover */}
                  <div
                    className="mt-3 flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity relative"
                    style={{ color: mode.color }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]"
                      style={{ backgroundColor: mode.color }}
                    >
                      &#9654;
                    </span>
                    Start Mission
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Chat Interface ─── */}
      {!showModeSelector && (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4">
          {/* Chat header */}
          <div
            className="flex items-center justify-between py-4 border-b flex-shrink-0"
            style={{ borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md"
                style={{
                  background: currentMode
                    ? `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}cc)`
                    : "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
                }}
              >
                {currentMode?.icon || "\uD83E\uDD16"}
              </div>
              <div>
                <h2 className="font-bold text-sm" style={{ color: "#1e3a5f" }}>
                  {currentMode?.label || "AI Tutor"}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: loading ? "#fbbf24" : "#00d4aa" }}
                  />
                  <span className="text-[10px] font-medium" style={{ color: "#64748b" }}>
                    {loading ? "Typing..." : "Online"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mode switcher pills (desktop) */}
              <div className="hidden sm:flex items-center gap-1.5">
                {PRACTICE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => startMode(mode)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110"
                    style={{
                      backgroundColor:
                        selectedMode === mode.id ? `${mode.color}20` : "#f1f5f9",
                      border:
                        selectedMode === mode.id
                          ? `2px solid ${mode.color}`
                          : "2px solid transparent",
                    }}
                    title={mode.label}
                  >
                    {mode.icon}
                  </button>
                ))}
              </div>

              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-md"
                style={{
                  backgroundColor: "white",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span>&#10005;</span> Clear
              </button>
            </div>
          </div>

          {/* Mobile mode switcher (horizontal scroll) */}
          <div
            className="sm:hidden flex gap-2 py-3 overflow-x-auto flex-shrink-0"
            style={{ scrollbarWidth: "none" }}
          >
            {PRACTICE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => startMode(mode)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  backgroundColor:
                    selectedMode === mode.id ? mode.color : "white",
                  color: selectedMode === mode.id ? "white" : "#64748b",
                  border: `1.5px solid ${selectedMode === mode.id ? mode.color : "#e2e8f0"}`,
                }}
              >
                <span>{mode.icon}</span> {mode.label}
              </button>
            ))}
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto py-4 space-y-4"
            style={{ minHeight: "400px", maxHeight: "calc(100vh - 280px)" }}
          >
            {messages
              .filter((_, i) => i > 0 || !selectedMode)
              .map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* AI avatar */}
                  {msg.role === "assistant" && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1 shadow-sm"
                      style={{
                        background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
                      }}
                    >
                      <span role="img" aria-label="tutor">
                        &#129302;
                      </span>
                    </div>
                  )}

                  <div
                    className="max-w-[80%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm"
                    style={
                      msg.role === "user"
                        ? {
                            backgroundColor: "#00d4aa",
                            color: "white",
                            borderBottomRightRadius: "6px",
                          }
                        : {
                            backgroundColor: "white",
                            color: "#334155",
                            border: "1px solid #e2e8f0",
                            borderBottomLeftRadius: "6px",
                          }
                    }
                  >
                    {msg.role === "assistant" && (
                      <p
                        className="text-[10px] font-extrabold uppercase tracking-wider mb-1.5"
                        style={{ color: "#1e3a5f" }}
                      >
                        AI Tutor
                      </p>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1 shadow-sm"
                  style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}
                >
                  <span role="img" aria-label="tutor">
                    &#129302;
                  </span>
                </div>
                <div
                  className="rounded-2xl px-5 py-4 shadow-sm"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderBottomLeftRadius: "6px",
                  }}
                >
                  <div className="flex gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{
                        backgroundColor: "#94a3b8",
                        animation: "bounce-dot 1.4s infinite ease-in-out",
                        animationDelay: "0s",
                      }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{
                        backgroundColor: "#94a3b8",
                        animation: "bounce-dot 1.4s infinite ease-in-out",
                        animationDelay: "0.2s",
                      }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{
                        backgroundColor: "#94a3b8",
                        animation: "bounce-dot 1.4s infinite ease-in-out",
                        animationDelay: "0.4s",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply chips */}
          {!loading && messages.length > 0 && (
            <div
              className="flex gap-2 py-2 overflow-x-auto flex-shrink-0"
              style={{ scrollbarWidth: "none" }}
            >
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold transition-all hover:shadow-md hover:scale-[1.03]"
                  style={{
                    backgroundColor: "white",
                    color: "#1e3a5f",
                    border: "1.5px solid #e2e8f0",
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input area (sticky bottom) */}
          <div
            className="py-4 flex-shrink-0 sticky bottom-0"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer or ask a question..."
                className="flex-1 px-4 py-3.5 rounded-xl text-sm font-medium border-2 focus:outline-none transition-all"
                style={{
                  borderColor: input.trim() ? "#00d4aa" : "#e2e8f0",
                  backgroundColor: "white",
                }}
                disabled={loading}
              />
              <button
                type="submit"
                className="px-5 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all hover:shadow-lg hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                style={{ backgroundColor: "#00d4aa" }}
                disabled={loading || !input.trim()}
              >
                <span className="hidden sm:inline">Send</span>
                <span className="sm:hidden text-lg">&#10148;</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes bounce-dot {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
