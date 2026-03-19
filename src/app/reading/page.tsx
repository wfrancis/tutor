"use client";

import { useState, useRef, useEffect } from "react";
import { readingPassages, literaryDevices, vocabularyWords } from "@/data/lessons";
import { useGameState } from "@/components/GameElements";

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
              <span key={i} className="group relative cursor-help">
                <span
                  className="border-b-2 border-dotted font-medium"
                  style={{ borderColor: "#00d4aa", color: "#0d7a65" }}
                >
                  {part.word}
                </span>
                <span
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-lg p-2.5 text-xs text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50"
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
  const { addEarnings, balanceCents } = useGameState();
  const [selectedPassage, setSelectedPassage] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDevices, setShowDevices] = useState(true);
  const [completedPassages, setCompletedPassages] = useState<Set<number>>(new Set());
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [mcQuestions, setMcQuestions] = useState<string>("");
  const readingRef = useRef<HTMLDivElement>(null);

  const passage = selectedPassage !== null ? readingPassages[selectedPassage] : null;
  const isPoetry = passage?.topic === "Poetry Analysis";

  useEffect(() => {
    if (showXpPopup) {
      const timer = setTimeout(() => setShowXpPopup(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showXpPopup]);

  async function getAIFeedback() {
    if (!passage) return;
    setLoading(true);
    setAiResponse("");
    setMcQuestions("");
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
      if (res.ok && selectedPassage !== null && !completedPassages.has(selectedPassage)) {
        setCompletedPassages(new Set([...completedPassages, selectedPassage]));
        addEarnings(15);
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
    setMcQuestions("");
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
      setMcQuestions(data.response);
    } catch {
      setMcQuestions("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  function selectPassage(index: number) {
    setSelectedPassage(index);
    setAnswers({});
    setAiResponse("");
    setMcQuestions("");
    setTimeout(() => {
      readingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const difficultyStars = (topic: string) => {
    const count = DIFFICULTY_MAP[topic] || 2;
    return Array.from({ length: 4 }, (_, i) => (
      <span key={i} style={{ color: i < count ? "#ff6b35" : "#d1d5db", fontSize: "14px" }}>
        {i < count ? "\u2605" : "\u2606"}
      </span>
    ));
  };

  // ─── Passage Selector (Level Select) ───
  if (selectedPassage === null) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#1e3a5f" }}>
                Reading Quest
              </h1>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                Choose a passage to start your mission
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg"
              style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)", color: "#00d4aa" }}
            >
              $ {(balanceCents / 100).toFixed(2)}
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="mb-8 p-4 rounded-2xl"
            style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
          >
            <div className="flex justify-between items-center mb-2 text-xs font-bold" style={{ color: "#1e3a5f" }}>
              <span>Campaign Progress</span>
              <span style={{ color: "#00d4aa" }}>
                {completedPassages.size}/{readingPassages.length} completed
              </span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: "#e2e8f0" }}>
              <div
                className="h-4 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${readingPassages.length > 0 ? (completedPassages.size / readingPassages.length) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #00d4aa, #00b894)",
                  boxShadow: "0 0 12px rgba(0,212,170,0.4)",
                }}
              />
            </div>
            <div className="flex gap-2 mt-3">
              {readingPassages.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: completedPassages.has(i) ? "#00d4aa" : "#e2e8f0",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Passage level cards */}
          <div className="grid sm:grid-cols-2 gap-5">
            {readingPassages.map((p, i) => {
              const completed = completedPassages.has(i);
              return (
                <button
                  key={i}
                  onClick={() => selectPassage(i)}
                  className="text-left rounded-2xl p-6 transition-all duration-200 hover:shadow-xl relative overflow-hidden group"
                  style={{
                    border: completed ? "2px solid #00d4aa" : "2px solid #e2e8f0",
                    background: completed
                      ? "linear-gradient(135deg, #f0fdf9, #ecfdf5)"
                      : "white",
                  }}
                >
                  {/* Hover glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, rgba(0,212,170,0.08), transparent 70%)",
                    }}
                  />

                  {/* Top row: icon + level badge */}
                  <div className="flex items-center justify-between mb-4 relative">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md transition-transform group-hover:scale-110"
                      style={{
                        background: completed
                          ? "linear-gradient(135deg, #00d4aa, #00b894)"
                          : "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
                      }}
                    >
                      {completed ? (
                        <span className="text-white text-xl">&#10003;</span>
                      ) : (
                        PASSAGE_ICONS[i] || "📄"
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {completed && (
                        <span
                          className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: "#00d4aa", color: "white" }}
                        >
                          +$0.15
                        </span>
                      )}
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
                          color: "white",
                        }}
                      >
                        Level {i + 1}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg mb-2 relative" style={{ color: "#1e3a5f" }}>
                    {p.title}
                  </h3>

                  {/* Topic badge + lesson */}
                  <div className="flex items-center gap-3 mb-3 relative">
                    <span
                      className="text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: "#00d4aa20", color: "#0d7a65" }}
                    >
                      {p.topic}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "#64748b" }}>
                      Lesson {p.lesson}
                    </span>
                  </div>

                  {/* Difficulty stars */}
                  <div className="flex items-center gap-0.5 relative">
                    <span className="text-[10px] font-semibold mr-2" style={{ color: "#64748b" }}>
                      Difficulty
                    </span>
                    {difficultyStars(p.topic)}
                  </div>

                  {/* Bottom play hint */}
                  <div
                    className="mt-4 flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity relative"
                    style={{ color: "#00d4aa" }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: "#00d4aa" }}
                    >
                      &#9654;
                    </span>
                    Start Reading
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Reading + Practice View ───
  if (!passage) return null;
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* XP popup */}
      {showXpPopup && (
        <div
          className="fixed top-20 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl font-extrabold text-lg shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #00d4aa, #00b894)",
            color: "white",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>$</span> +$0.15 earned!
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button
            onClick={() => setSelectedPassage(null)}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:shadow-md"
            style={{ color: "#1e3a5f", backgroundColor: "white", border: "1px solid #e2e8f0" }}
          >
            <span style={{ fontSize: "1.1rem" }}>&larr;</span> All Passages
          </button>

          <div className="flex items-center gap-3">
            {/* Mini progress */}
            <div className="hidden sm:flex items-center gap-1.5">
              {readingPassages.map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      completedPassages.has(i) ? "#00d4aa" : i === selectedPassage ? "#1e3a5f" : "#e2e8f0",
                    boxShadow: i === selectedPassage ? "0 0 0 3px rgba(30,58,95,0.2)" : "none",
                  }}
                />
              ))}
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-md"
              style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)", color: "#00d4aa" }}
            >
              $ {(balanceCents / 100).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex gap-6 relative">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Passage display */}
            <div
              ref={readingRef}
              className="rounded-2xl p-6 sm:p-8 mb-6 shadow-sm"
              style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
            >
              {/* Passage header badges */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full"
                  style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)", color: "#00d4aa" }}
                >
                  Level {selectedPassage + 1}
                </span>
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#00d4aa20", color: "#0d7a65" }}
                >
                  {passage.topic}
                </span>
                <span className="text-xs font-medium" style={{ color: "#64748b" }}>
                  Lesson {passage.lesson}
                </span>
                <div className="flex items-center gap-0.5 ml-auto">
                  {difficultyStars(passage.topic)}
                </div>
              </div>

              {/* Title */}
              <h2
                className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight"
                style={{ color: "#1e3a5f" }}
              >
                {passage.title}
              </h2>

              <div className="my-5 border-t" style={{ borderColor: "#e2e8f0" }} />

              {/* Passage text */}
              <div
                className="rounded-xl p-5 sm:p-6"
                style={{
                  backgroundColor: "#fdfcfa",
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: isPoetry ? "1rem" : "1.05rem",
                  border: "1px solid #f0ede8",
                }}
              >
                {highlightVocab(passage.content, !!isPoetry)}
              </div>

              <p className="mt-3 text-[11px] font-medium" style={{ color: "#64748b" }}>
                <span style={{ color: "#00d4aa" }}>&#9679;</span> Hover on{" "}
                <span style={{ color: "#0d7a65", borderBottom: "2px dotted #00d4aa" }}>
                  highlighted words
                </span>{" "}
                to see definitions
              </p>

              {/* Literary Devices toggle (mobile) */}
              <button
                className="mt-5 w-full sm:hidden flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: showDevices ? "#1e3a5f" : "white",
                  color: showDevices ? "white" : "#1e3a5f",
                  border: showDevices ? "2px solid #1e3a5f" : "2px solid #e2e8f0",
                }}
                onClick={() => setShowDevices(!showDevices)}
              >
                <span>&#128218;</span> Literary Devices Reference
                <span className="text-xs ml-1">{showDevices ? "\u25B2" : "\u25BC"}</span>
              </button>

              {/* Mobile literary devices panel */}
              {showDevices && (
                <div
                  className="mt-3 sm:hidden rounded-xl p-4"
                  style={{ backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0" }}
                >
                  <div className="grid gap-2.5">
                    {literaryDevices.map((d) => (
                      <div
                        key={d.name}
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
                      >
                        <p className="font-bold text-sm" style={{ color: "#1e3a5f" }}>
                          {d.name}
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#334155" }}>
                          {d.definition}
                        </p>
                        <p className="text-[11px] mt-1.5 italic" style={{ color: "#64748b" }}>
                          e.g. {d.example}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Practice questions */}
            <div
              className="rounded-2xl p-6 sm:p-8 mb-6 shadow-sm"
              style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "linear-gradient(135deg, #ff6b35, #ff8f5e)", color: "white" }}
                >
                  &#9998;
                </div>
                <div>
                  <h3 className="font-extrabold text-lg" style={{ color: "#1e3a5f" }}>
                    Comprehension Questions
                  </h3>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    Answer all three to earn +$0.15
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  {
                    key: "q1",
                    num: 1,
                    label: "What is the main idea or theme of this text?",
                  },
                  {
                    key: "q2",
                    num: 2,
                    label:
                      "What literary devices or techniques can you identify? Give specific examples from the text.",
                  },
                  {
                    key: "q3",
                    num: 3,
                    label:
                      "What can you infer about the author\u2019s purpose or the deeper meaning?",
                  },
                ].map((q) => (
                  <div key={q.key}>
                    <label className="flex items-start gap-2 text-sm font-bold mb-2" style={{ color: "#334155" }}>
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-extrabold mt-0.5"
                        style={{ backgroundColor: "#1e3a5f" }}
                      >
                        {q.num}
                      </span>
                      {q.label}
                    </label>
                    <textarea
                      className="w-full p-4 rounded-xl text-sm border-2 focus:outline-none transition-all"
                      style={{
                        minHeight: "100px",
                        borderColor: answers[q.key] ? "#00d4aa" : "#e2e8f0",
                        fontFamily: "system-ui, sans-serif",
                        backgroundColor: answers[q.key] ? "#f0fdf9" : "#fafafa",
                        lineHeight: "1.6",
                        color: "#1e293b",
                      }}
                      placeholder="Type your answer here..."
                      value={answers[q.key] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6 flex-wrap">
                <button
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                  style={{ backgroundColor: "#00d4aa" }}
                  onClick={getAIFeedback}
                  disabled={loading || !answers.q1}
                >
                  {loading && !mcQuestions ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>&#10004;</span> Get AI Feedback
                    </span>
                  )}
                </button>
                <button
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                  style={{ backgroundColor: "#ff6b35" }}
                  onClick={generateQuestions}
                  disabled={loading}
                >
                  {loading && !aiResponse ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>&#128300;</span> Generate Test Questions
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* AI Feedback Response */}
            {aiResponse && (
              <div
                className="rounded-2xl p-6 sm:p-8 mb-6 shadow-md"
                style={{
                  border: "2px solid #00d4aa",
                  backgroundColor: "#f0fdf9",
                }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-md"
                    style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}
                  >
                    <span role="img" aria-label="tutor">&#129302;</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg" style={{ color: "#1e3a5f" }}>
                      AI Tutor Feedback
                    </h3>
                    <p className="text-xs font-medium" style={{ color: "#64748b" }}>
                      Based on your answers
                    </p>
                  </div>
                </div>
                <div
                  className="text-sm leading-relaxed whitespace-pre-line rounded-xl p-5"
                  style={{
                    color: "#334155",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {aiResponse}
                </div>
              </div>
            )}

            {/* Generated Test Questions */}
            {mcQuestions && (
              <div
                className="rounded-2xl p-6 sm:p-8 mb-6 shadow-md"
                style={{
                  border: "2px solid #ff6b35",
                  backgroundColor: "#fff8f5",
                }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-md"
                    style={{ background: "linear-gradient(135deg, #ff6b35, #ff8f5e)" }}
                  >
                    <span role="img" aria-label="quiz">&#128300;</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg" style={{ color: "#1e3a5f" }}>
                      Practice Test Questions
                    </h3>
                    <p className="text-xs font-medium" style={{ color: "#64748b" }}>
                      Multiple choice questions based on the passage
                    </p>
                  </div>
                </div>
                <div
                  className="text-sm leading-relaxed whitespace-pre-line rounded-xl p-5"
                  style={{
                    color: "#334155",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {mcQuestions}
                </div>
              </div>
            )}
          </div>

          {/* Desktop sidebar: Literary Devices */}
          <div className="hidden sm:block w-72 flex-shrink-0">
            <div className="sticky top-6">
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-t-xl font-bold text-sm text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}
                onClick={() => setShowDevices(!showDevices)}
              >
                <span className="flex items-center gap-2">
                  <span>&#128218;</span> Literary Devices
                </span>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  {showDevices ? "\u25B2" : "\u25BC"}
                </span>
              </button>
              {showDevices && (
                <div
                  className="rounded-b-xl p-3 max-h-[70vh] overflow-y-auto shadow-md"
                  style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderTop: "none" }}
                >
                  <div className="space-y-2.5">
                    {literaryDevices.map((d) => (
                      <div
                        key={d.name}
                        className="p-3.5 rounded-xl bg-white transition-all hover:shadow-sm"
                        style={{ border: "1px solid #e2e8f0" }}
                      >
                        <p className="font-bold text-sm" style={{ color: "#1e3a5f" }}>
                          {d.name}
                        </p>
                        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#334155" }}>
                          {d.definition}
                        </p>
                        <p
                          className="text-[11px] mt-1.5 italic px-2 py-1.5 rounded-lg"
                          style={{ color: "#64748b", backgroundColor: "#f8fafc" }}
                        >
                          e.g. {d.example}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
