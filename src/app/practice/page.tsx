"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRACTICE_MODES = [
  { id: "vocab", label: "Vocabulary Practice", prompt: "Help me practice vocabulary words from my tutoring lessons. Quiz me on definitions, usage in context, and help me use them in sentences." },
  { id: "reading", label: "Reading Comprehension", prompt: "Give me a short reading passage appropriate for standardized test prep and ask me comprehension questions about it. Topics can include history, science, literature, or culture." },
  { id: "literary", label: "Literary Devices", prompt: "Help me practice identifying and understanding literary devices like metaphor, simile, imagery, personification, alliteration, hyperbole, and onomatopoeia. Give me examples and quiz me." },
  { id: "grammar", label: "Grammar & Writing", prompt: "Help me practice grammar and writing skills for standardized tests. Cover things like sentence structure, punctuation, word choice, and paragraph organization." },
  { id: "test", label: "Test Prep Questions", prompt: "Give me practice questions in the style of standardized English tests. Include multiple choice reading comprehension, vocabulary in context, and text analysis questions." },
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">AI Practice Session</h1>
      <p className="text-[var(--muted)] mb-6">
        Chat with your AI tutor for personalized practice. Pick a topic or ask anything!
      </p>

      {/* Mode selector */}
      {!selectedMode && messages.length === 0 && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {PRACTICE_MODES.map((mode) => (
            <button key={mode.id} className="card text-left hover:border-[var(--primary)] transition-colors" onClick={() => startMode(mode)}>
              <h3 className="font-bold mb-1">{mode.label}</h3>
              <p className="text-xs text-[var(--muted)]">{mode.prompt.slice(0, 80)}...</p>
            </button>
          ))}
        </div>
      )}

      {/* Chat messages */}
      {(selectedMode || messages.length > 0) && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {PRACTICE_MODES.map((mode) => (
              <button key={mode.id} className={`btn text-xs ${selectedMode === mode.id ? "btn-primary" : "btn-secondary"}`} onClick={() => startMode(mode)}>
                {mode.label}
              </button>
            ))}
            <button className="btn btn-secondary text-xs ml-auto" onClick={() => { setMessages([]); setSelectedMode(null); }}>
              Clear Chat
            </button>
          </div>

          <div className="card min-h-[400px] max-h-[600px] overflow-y-auto mb-4 p-4">
            {messages.filter((_, i) => i > 0 || !selectedMode).map((msg, i) => (
              <div key={i} className={`mb-4 animate-in ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <div className={`inline-block max-w-[85%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-line ${msg.role === "user" ? "bg-[var(--primary)] text-white rounded-br-sm" : "bg-gray-100 rounded-bl-sm"}`}>
                  {msg.role === "assistant" && <p className="text-xs font-semibold text-[var(--primary)] mb-1">AI Tutor</p>}
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left mb-4 animate-in">
                <div className="inline-block bg-gray-100 p-3 rounded-lg rounded-bl-sm text-sm text-[var(--muted)]">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer or ask a question..." className="flex-1 p-3 border rounded-lg text-sm" disabled={loading} />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
