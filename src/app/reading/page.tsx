"use client";

import { useState, useRef, useEffect } from "react";
import { readingPassages, literaryDevices, vocabularyWords } from "@/data/lessons";

const PASSAGE_ICONS = ["📜", "💬", "🏛️", "🎵"];
const DIFFICULTY_MAP: Record<string, number> = {
  "Poetry Analysis": 3,
  "Historical Reading Comprehension": 2,
  "Cultural Reading Comprehension": 2,
};

function highlightVocab(text: string, isPoetry: boolean) {
  const vocabMap = new Map(
    vocabularyWords.map((w) => [w.term.toLowerCase(), w.definition])
  );
  const vocabTerms = vocabularyWords.map((w) => w.term);
  const pattern = new RegExp(
    `\\b(${vocabTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  );

  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    const parts: (string | { word: string; def: string })[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const linePattern = new RegExp(pattern.source, "gi");

    while ((match = linePattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      parts.push({
        word: match[0],
        def: vocabMap.get(match[0].toLowerCase()) || "",
      });
      lastIndex = linePattern.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
    if (parts.length === 0) parts.push(line);

    return (
      <div key={lineIdx} className="flex">
        {isPoetry && (
          <span
            className="select-none text-right mr-4 opacity-30 text-xs"
            style={{ minWidth: "1.5rem", fontFamily: "monospace", lineHeight: "1.75" }}
          >
            {line.trim() ? lineIdx + 1 : ""}
          </span>
        )}
        <span style={{ lineHeight: "1.75" }}>
          {parts.map((part, i) =>
            typeof part === "string" ? (
              <span key={i}>{part}</span>
            ) : (
              <span key={i} className="vocab-highlight group relative cursor-help">
                <span
                  className="border-b-2 border-dotted border-teal-400 text-teal-700 font-medium"
                  style={{ borderColor: "#00d4aa" }}
                >
                  {part.word}
                </span>
                <span className="vocab-tooltip pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-lg p-2.5 text-xs text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  <strong className="block mb-0.5" style={{ color: "#00d4aa" }}>
                    {part.word}
                  </strong>
                  {part.def}
                </span>
              </span>
            )
          )}
        </span>
      </div>
    );
  });
}

export default function ReadingPage() {
  const [selectedPassage, setSelectedPassage] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [completedPassages, setCompletedPassages] = useState<Set<number>>(new Set());
  const [xp, setXp] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const readingRef = useRef<HTMLDivElement>(null);

  const passage = selectedPassage !== null ? readingPassages[selectedPassage] : null;
  const isPoetry = passage?.topic === "Poetry Analysis";

  useEffect(() => {
    if (showXpPopup) {
      const timer = setTimeout(() => setShowXpPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showXpPopup]);

  async function getAIFeedback() {
    if (!passage) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reading",
          passage: passage.title,
          passageContent: passage.content,
          answers,
        }),
      });
      const data = await res.json();
      setAiResponse(data.response);
      if (selectedPassage !== null && !completedPassages.has(selectedPassage)) {
        setCompletedPassages(new Set([...completedPassages, selectedPassage]));
        setXp((prev) => prev + 15);
        setShowXpPopup(true);
      }
    } catch {
      setAiResponse("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function generateQuestions() {
    if (!passage) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generate_questions",
          passage: passage.title,
          passageContent: passage.content,
        }),
      });
      const data = await res.json();
      setAiResponse(data.response);
    } catch {
      setAiResponse("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  function selectPassage(index: number) {
    setSelectedPassage(index);
    setAnswers({});
    setAiResponse("");
    setTimeout(() => {
      readingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const difficultyStars = (topic: string) => {
    const count = DIFFICULTY_MAP[topic] || 2;
    return Array.from({ length: 4 }, (_, i) => (
      <span key={i} className="text-sm" style={{ color: i < count ? "#ff6b35" : "#d1d5db" }}>
        {i < count ? "\u2605" : "\u2606"}
      </span>
    ));
  };

  // Passage selector (level select)
  if (selectedPassage === null) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1e3a5f" }}>
              Reading & Analysis
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              Choose a passage to begin your reading quest
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)", color: "#00d4aa" }}
          >
            <span style={{ fontSize: "1.1rem" }}>&#9889;</span> {xp} XP
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 text-xs font-semibold" style={{ color: "#64748b" }}>
            <span>Campaign Progress</span>
            <span>{completedPassages.size}/{readingPassages.length} completed</span>
          </div>
          <div className="w-full h-3 rounded-full" style={{ backgroundColor: "#e2e8f0" }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(completedPassages.size / readingPassages.length) * 100}%`,
                background: "linear-gradient(90deg, #00d4aa, #00b894)",
              }}
            />
          </div>
        </div>

        {/* Passage level cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {readingPassages.map((p, i) => {
            const completed = completedPassages.has(i);
            return (
              <button
                key={i}
                onClick={() => selectPassage(i)}
                className="text-left rounded-2xl p-5 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden"
                style={{
                  borderColor: completed ? "#00d4aa" : "#e2e8f0",
                  background: completed
                    ? "linear-gradient(135deg, #f0fdf9, #ecfdf5)"
                    : "white",
                }}
              >
                {/* Level badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: completed
                        ? "linear-gradient(135deg, #00d4aa, #00b894)"
                        : "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
                    }}
                  >
                    {completed ? "\u2713" : PASSAGE_ICONS[i] || "📄"}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: "#1e3a5f15",
                        color: "#1e3a5f",
                      }}
                    >
                      Level {i + 1}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1" style={{ color: "#1e3a5f" }}>
                  {p.title}
                </h3>

                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: "#00d4aa20", color: "#0d7a65" }}
                  >
                    {p.topic}
                  </span>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    Lesson {p.lesson}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">{difficultyStars(p.topic)}</div>

                {completed && (
                  <div
                    className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#00d4aa", color: "white" }}
                  >
                    +15 XP
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Reading + practice view
  if (!passage) return null;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* XP popup */}
      {showXpPopup && (
        <div
          className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl font-bold text-lg shadow-2xl animate-in"
          style={{ background: "linear-gradient(135deg, #00d4aa, #00b894)", color: "white" }}
        >
          +15 XP earned!
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={() => setSelectedPassage(null)}
          className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
          style={{ color: "#1e3a5f", backgroundColor: "#1e3a5f10" }}
        >
          <span>&larr;</span> Back to Passages
        </button>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)", color: "#00d4aa" }}
        >
          <span style={{ fontSize: "1.1rem" }}>&#9889;</span> {xp} XP
        </div>
      </div>

      <div className="flex gap-6 relative">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Passage display */}
          <div ref={readingRef} className="rounded-2xl border p-6 mb-6 bg-white" style={{ borderColor: "#e2e8f0" }}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span
                className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ backgroundColor: "#1e3a5f", color: "#00d4aa" }}
              >
                Level {selectedPassage + 1}
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#00d4aa20", color: "#0d7a65" }}
              >
                {passage.topic}
              </span>
              <span className="text-xs" style={{ color: "#64748b" }}>
                Lesson {passage.lesson}
              </span>
              <div className="flex items-center gap-0.5 ml-auto">
                {difficultyStars(passage.topic)}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1" style={{ color: "#1e3a5f" }}>
              {passage.title}
            </h2>

            <div className="my-4 border-t" style={{ borderColor: "#e2e8f020" }} />

            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#fafaf8",
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: isPoetry ? "1rem" : "1.05rem",
              }}
            >
              {highlightVocab(passage.content, !!isPoetry)}
            </div>

            {/* Literary Devices toggle (mobile) */}
            <button
              className="mt-4 w-full sm:hidden flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              style={{
                backgroundColor: showDevices ? "#1e3a5f" : "#1e3a5f10",
                color: showDevices ? "white" : "#1e3a5f",
              }}
              onClick={() => setShowDevices(!showDevices)}
            >
              <span>&#128218;</span> Literary Devices Reference
              <span className="text-xs">{showDevices ? "\u25B2" : "\u25BC"}</span>
            </button>

            {/* Mobile literary devices panel */}
            {showDevices && (
              <div className="mt-3 sm:hidden rounded-xl border p-4 animate-in" style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
                <div className="grid gap-2.5">
                  {literaryDevices.map((d) => (
                    <div key={d.name} className="p-3 rounded-lg" style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}>
                      <p className="font-bold text-sm" style={{ color: "#1e3a5f" }}>{d.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#334155" }}>{d.definition}</p>
                      <p className="text-xs mt-1 italic" style={{ color: "#64748b" }}>e.g. {d.example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Practice questions */}
          <div className="rounded-2xl border p-6 mb-6 bg-white" style={{ borderColor: "#e2e8f0" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#1e3a5f" }}>
              <span className="mr-2">&#9998;</span> Comprehension Questions
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                  1. What is the main idea or theme of this text?
                </label>
                <textarea
                  className="w-full p-3.5 rounded-xl text-sm border-2 focus:outline-none transition-colors"
                  style={{
                    minHeight: "90px",
                    borderColor: answers.q1 ? "#00d4aa" : "#e2e8f0",
                    fontFamily: "system-ui, sans-serif",
                  }}
                  placeholder="Type your answer..."
                  value={answers["q1"] || ""}
                  onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                  2. What literary devices or techniques can you identify? Give specific examples from the text.
                </label>
                <textarea
                  className="w-full p-3.5 rounded-xl text-sm border-2 focus:outline-none transition-colors"
                  style={{
                    minHeight: "90px",
                    borderColor: answers.q2 ? "#00d4aa" : "#e2e8f0",
                    fontFamily: "system-ui, sans-serif",
                  }}
                  placeholder="Type your answer..."
                  value={answers["q2"] || ""}
                  onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                  3. What can you infer about the author&apos;s purpose or the deeper meaning?
                </label>
                <textarea
                  className="w-full p-3.5 rounded-xl text-sm border-2 focus:outline-none transition-colors"
                  style={{
                    minHeight: "90px",
                    borderColor: answers.q3 ? "#00d4aa" : "#e2e8f0",
                    fontFamily: "system-ui, sans-serif",
                  }}
                  placeholder="Type your answer..."
                  value={answers["q3"] || ""}
                  onChange={(e) => setAnswers({ ...answers, q3: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5 flex-wrap">
              <button
                className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: "#00d4aa" }}
                onClick={getAIFeedback}
                disabled={loading || !answers.q1}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <span>&#10004; Get AI Feedback</span>
                )}
              </button>
              <button
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: "#ff6b35",
                  color: "white",
                }}
                onClick={generateQuestions}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span>&#128300; Generate Test Questions</span>
                )}
              </button>
            </div>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div className="rounded-2xl border-2 p-6 mb-6 animate-in" style={{ borderColor: "#00d4aa", backgroundColor: "#f0fdf9" }}>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}
                >
                  <span role="img" aria-label="tutor">&#129302;</span>
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: "#1e3a5f" }}>AI Tutor Feedback</h3>
                  <p className="text-xs" style={{ color: "#64748b" }}>Based on your answers</p>
                </div>
              </div>
              <div
                className="text-sm leading-relaxed whitespace-pre-line pl-13"
                style={{ color: "#334155", paddingLeft: "3.25rem" }}
              >
                {aiResponse}
              </div>
            </div>
          )}
        </div>

        {/* Desktop sidebar: Literary Devices */}
        <div className="hidden sm:block w-72 flex-shrink-0">
          <div className="sticky top-6">
            <button
              className="w-full flex items-center justify-between px-4 py-3 rounded-t-xl font-bold text-sm text-white"
              style={{ backgroundColor: "#1e3a5f" }}
              onClick={() => setShowDevices(!showDevices)}
            >
              <span>&#128218; Literary Devices</span>
              <span className="text-xs">{showDevices ? "\u25B2" : "\u25BC"}</span>
            </button>
            {showDevices && (
              <div
                className="rounded-b-xl border border-t-0 p-3 max-h-[70vh] overflow-y-auto animate-in"
                style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}
              >
                <div className="space-y-2.5">
                  {literaryDevices.map((d) => (
                    <div key={d.name} className="p-3 rounded-lg bg-white border" style={{ borderColor: "#e2e8f0" }}>
                      <p className="font-bold text-sm" style={{ color: "#1e3a5f" }}>{d.name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#334155" }}>{d.definition}</p>
                      <p className="text-[11px] mt-1 italic" style={{ color: "#64748b" }}>e.g. {d.example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
