"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { vocabularyWords as defaultWords, VocabWord } from "@/data/lessons";
import { useGameState } from "@/components/GameElements";

// ── Types ──────────────────────────────────────────────
type Mode = "flashcards" | "quiz" | "fill";
type Mastery = "know" | "learning" | "unseen";

interface QuizQuestion {
  word: VocabWord;
  options: string[];
}

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

// ── Helpers ────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(pool: VocabWord[], all: VocabWord[], count = 10): QuizQuestion[] {
  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
  return picked.map((word) => {
    const wrongs = shuffle(all.filter((w) => w.term !== word.term))
      .slice(0, 3)
      .map((w) => w.definition);
    return { word, options: shuffle([...wrongs, word.definition]) };
  });
}

function starRating(score: number, total: number): number {
  const pct = score / total;
  if (pct === 1) return 5;
  if (pct >= 0.9) return 4;
  if (pct >= 0.7) return 3;
  if (pct >= 0.5) return 2;
  return 1;
}

// ── Component ──────────────────────────────────────────
export default function VocabularyPage() {
  const { addEarnings, balanceCents } = useGameState();
  const [vocabularyWords, setVocabularyWords] = useState<VocabWord[]>(defaultWords);

  useEffect(() => {
    fetch("/api/lessons")
      .then((res) => res.json())
      .then((data) => {
        if (data.vocabWords?.length) setVocabularyWords(data.vocabWords);
      })
      .catch(() => {});
  }, []);

  // Mode & filters
  const [mode, setMode] = useState<Mode>("flashcards");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastery, setMastery] = useState<Record<string, Mastery>>({});

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<Record<number, string>>({});
  const [quizCorrect, setQuizCorrect] = useState<Record<number, boolean>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xpPopup, setXpPopup] = useState<{ amount: number; key: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [reviewMode, setReviewMode] = useState(false);

  // Fill-in-the-blank state
  const [fillQuestions, setFillQuestions] = useState<VocabWord[]>([]);
  const [fillIndex, setFillIndex] = useState(0);
  const [fillInput, setFillInput] = useState("");
  const [fillResult, setFillResult] = useState<"correct" | "wrong" | null>(null);
  const [fillHintUsed, setFillHintUsed] = useState(false);
  const [fillScore, setFillScore] = useState(0);
  const [fillDone, setFillDone] = useState(false);
  const [fillMissed, setFillMissed] = useState<VocabWord[]>([]);

  // Stats
  const [highScore, setHighScore] = useState(0);

  // Touch
  const touchStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const lessons = useMemo(
    () => Array.from(new Set(vocabularyWords.map((w) => w.lesson))).sort((a, b) => a - b),
    [vocabularyWords]
  );

  const filteredWords = useMemo(() => {
    if (selectedLesson === null) return vocabularyWords;
    return vocabularyWords.filter((w) => w.lesson === selectedLesson);
  }, [selectedLesson, vocabularyWords]);

  const currentCard = filteredWords[cardIndex];

  const masteredCount = useMemo(
    () => Object.values(mastery).filter((v) => v === "know").length,
    [mastery]
  );

  // ── Confetti ───────────────────────────────────────
  const fireConfetti = useCallback(() => {
    const colors = ["#00d4aa", "#ff6b35", "#7c3aed", "#22c55e", "#f59e0b", "#ef4444"];
    const pieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
    }));
    setConfettiPieces(pieces);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4500);
  }, []);

  // ── XP Popup ───────────────────────────────────────
  const showXpGain = useCallback((amount: number) => {
    setXpPopup({ amount, key: Date.now() });
    setTimeout(() => setXpPopup(null), 1200);
  }, []);

  // ── Mode Switching ─────────────────────────────────
  function switchMode(m: Mode) {
    setMode(m);
    if (m === "flashcards") {
      setCardIndex(0);
      setFlipped(false);
    }
    if (m === "quiz") {
      startQuiz();
    }
    if (m === "fill") {
      startFill();
    }
  }

  function startQuiz(words?: VocabWord[]) {
    const pool = words || filteredWords;
    const qs = buildQuiz(pool, vocabularyWords);
    setQuizQuestions(qs);
    setQuizIndex(0);
    setQuizAnswered({});
    setQuizCorrect({});
    setQuizDone(false);
    setStreak(0);
    setReviewMode(!!words);
  }

  function startFill(words?: VocabWord[]) {
    const pool = words || filteredWords;
    const qs = shuffle(pool.filter((w) => w.example)).slice(0, Math.min(10, pool.length));
    setFillQuestions(qs);
    setFillIndex(0);
    setFillInput("");
    setFillResult(null);
    setFillHintUsed(false);
    setFillScore(0);
    setFillDone(false);
    setFillMissed([]);
  }

  // ── Flashcard Swipe ────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 60) {
      if (diff < 0 && cardIndex < filteredWords.length - 1) {
        setCardIndex((i) => i + 1);
        setFlipped(false);
      } else if (diff > 0 && cardIndex > 0) {
        setCardIndex((i) => i - 1);
        setFlipped(false);
      }
    }
  }

  // ── Quiz Answer ────────────────────────────────────
  function handleQuizAnswer(qi: number, answer: string) {
    if (quizAnswered[qi] !== undefined) return;
    const correct = answer === quizQuestions[qi].word.definition;
    setQuizAnswered((prev) => ({ ...prev, [qi]: answer }));
    setQuizCorrect((prev) => ({ ...prev, [qi]: correct }));

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      const bonus = newStreak >= 3 ? 20 : 10;
      addEarnings(bonus);
      showXpGain(bonus);
      // Mark as mastered
      setMastery((prev) => ({ ...prev, [quizQuestions[qi].word.term]: "know" }));
    } else {
      setStreak(0);
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (qi < quizQuestions.length - 1) {
        setQuizIndex(qi + 1);
      } else {
        finishQuiz(correct);
      }
    }, 1200);
  }

  function finishQuiz(lastCorrect?: boolean) {
    setQuizDone(true);
    const totalCorrect = Object.values(quizCorrect).filter(Boolean).length + (lastCorrect ? 1 : 0);
    if (totalCorrect > highScore) setHighScore(totalCorrect);
    if (totalCorrect === quizQuestions.length) {
      fireConfetti();
    }
  }

  const quizScore = useMemo(
    () => Object.values(quizCorrect).filter(Boolean).length,
    [quizCorrect]
  );

  const missedWords = useMemo(
    () =>
      quizQuestions
        .filter((_, i) => quizCorrect[i] === false)
        .map((q) => q.word),
    [quizQuestions, quizCorrect]
  );

  // ── Fill-in-the-Blank ──────────────────────────────
  function handleFillSubmit() {
    if (!fillQuestions[fillIndex]) return;
    const word = fillQuestions[fillIndex];
    const correct = fillInput.trim().toLowerCase() === word.term.toLowerCase();
    setFillResult(correct ? "correct" : "wrong");

    if (correct) {
      const pts = fillHintUsed ? 5 : 10;
      setFillScore((s) => s + pts);
      addEarnings(pts);
      showXpGain(pts);
      setMastery((prev) => ({ ...prev, [word.term]: "know" }));
    } else {
      setFillMissed((prev) => [...prev, word]);
    }

    setTimeout(() => {
      if (fillIndex < fillQuestions.length - 1) {
        setFillIndex((i) => i + 1);
        setFillInput("");
        setFillResult(null);
        setFillHintUsed(false);
      } else {
        setFillDone(true);
        if (fillScore + (correct ? (fillHintUsed ? 5 : 10) : 0) === fillQuestions.length * 10) {
          fireConfetti();
        }
      }
    }, 1500);
  }

  function handleFillHint() {
    if (!fillQuestions[fillIndex]) return;
    setFillHintUsed(true);
    setFillInput(fillQuestions[fillIndex].term[0]);
  }

  function blankOutWord(example: string, term: string): string {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return example.replace(regex, "________");
  }

  // ── Lesson filter change ───────────────────────────
  function changeLesson(l: number | null) {
    setSelectedLesson(l);
    setCardIndex(0);
    setFlipped(false);
    setHighScore(0);
    if (mode === "quiz") startQuiz();
    if (mode === "fill") startFill();
  }

  // Reinitialize quiz/fill when lesson changes
  useEffect(() => {
    if (mode === "quiz") {
      const pool = selectedLesson === null ? vocabularyWords : vocabularyWords.filter((w) => w.lesson === selectedLesson);
      startQuiz(pool);
    }
    if (mode === "fill") {
      const pool = selectedLesson === null ? vocabularyWords : vocabularyWords.filter((w) => w.lesson === selectedLesson);
      startFill(pool);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLesson]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-32 sm:pb-8">
      {/* ── Confetti Overlay ── */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              className="confetti-piece"
              style={{
                left: `${p.left}%`,
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── XP Popup ── */}
      {xpPopup && (
        <div key={xpPopup.key} className="points-popup">
          <span
            className="text-3xl font-black"
            style={{
              color: xpPopup.amount >= 20 ? "var(--special)" : "var(--accent)",
              textShadow: `0 0 20px ${xpPopup.amount >= 20 ? "var(--special-glow)" : "var(--accent-glow)"}`,
            }}
          >
            +${(xpPopup.amount / 100).toFixed(2)}
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Vocabulary Quest</h1>
          <p className="text-[var(--foreground-muted)] text-sm mt-1">
            {filteredWords.length} words {selectedLesson === null ? "from all lessons" : `from Lesson ${selectedLesson}`}
          </p>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="xp-badge">
          <span>$</span> ${(balanceCents / 100).toFixed(2)}
        </div>
        <div className="streak-badge">
          <span className="streak-fire">&#128293;</span> Best Streak: {bestStreak}
        </div>
        <div className="level-badge">
          <span>&#9733;</span> {masteredCount} Mastered
        </div>
        {highScore > 0 && (
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-extrabold text-sm"
            style={{
              background: "linear-gradient(135deg, var(--warning), #d97706)",
              color: "#fff",
              boxShadow: "0 2px 10px rgba(245,158,11,0.35)",
            }}
          >
            <span>&#127942;</span> High Score: {highScore}/{Math.min(10, filteredWords.length)}
          </div>
        )}
      </div>

      {/* ── Mode Tabs ── */}
      <div className="difficulty-selector mb-4 w-full sm:w-auto">
        {(
          [
            { key: "flashcards" as Mode, label: "Flashcards", icon: "\uD83C\uDCCF" },
            { key: "quiz" as Mode, label: "Quiz", icon: "\uD83C\uDFAF" },
            { key: "fill" as Mode, label: "Fill-in-the-Blank", icon: "\u270D\uFE0F" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            className={`difficulty-option flex-1 sm:flex-none ${mode === tab.key ? "active-easy" : ""}`}
            onClick={() => switchMode(tab.key)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Lesson Filter Pills ── */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          className={`btn btn-sm ${selectedLesson === null ? "btn-primary" : "btn-secondary"}`}
          onClick={() => changeLesson(null)}
        >
          All
        </button>
        {lessons.map((l) => (
          <button
            key={l}
            className={`btn btn-sm ${selectedLesson === l ? "btn-primary" : "btn-secondary"}`}
            onClick={() => changeLesson(l)}
          >
            L{l}
          </button>
        ))}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           FLASHCARDS MODE
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {mode === "flashcards" && currentCard && (
        <div className="animate-in">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[var(--foreground-muted)]">
              Card {cardIndex + 1} of {filteredWords.length}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              Lesson {currentCard.lesson}
            </span>
          </div>
          <div className="progress-bar mb-5">
            <div
              className="progress-fill"
              style={{ width: `${((cardIndex + 1) / filteredWords.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Card */}
          <div
            ref={cardRef}
            className="cursor-pointer mb-5"
            style={{ perspective: "1000px" }}
            onClick={() => setFlipped(!flipped)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                minHeight: "280px",
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 card flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 font-bold">
                  Term
                </p>
                <h2 className="text-4xl sm:text-5xl font-black mb-4" style={{ color: "var(--accent)" }}>
                  {currentCard.term}
                </h2>
                <p className="text-sm text-[var(--foreground-muted)]">Tap to flip</p>
                {mastery[currentCard.term] === "know" && (
                  <span
                    className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: "var(--accent)", color: "var(--background)" }}
                  >
                    Mastered
                  </span>
                )}
                {mastery[currentCard.term] === "learning" && (
                  <span
                    className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: "var(--energy)", color: "#fff" }}
                  >
                    Learning
                  </span>
                )}
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 card flex flex-col items-center justify-center text-center"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 font-bold">
                  Definition
                </p>
                <h2 className="text-xl sm:text-2xl font-bold mb-5 max-w-lg leading-relaxed">
                  {currentCard.definition}
                </h2>
                {currentCard.example && (
                  <div className="max-w-lg">
                    <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-1 font-bold">
                      Example
                    </p>
                    <p className="text-base italic text-[var(--foreground-muted)]">
                      &ldquo;{currentCard.example}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Know It / Still Learning Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              className="btn flex-1 text-base font-extrabold"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                color: "var(--background)",
                boxShadow: "0 4px 14px var(--accent-glow)",
              }}
              onClick={() => {
                setMastery((prev) => ({ ...prev, [currentCard.term]: "know" }));
                if (cardIndex < filteredWords.length - 1) {
                  setCardIndex((i) => i + 1);
                  setFlipped(false);
                }
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>&#10003;</span> Know It
            </button>
            <button
              className="btn flex-1 text-base font-extrabold"
              style={{
                background: "linear-gradient(135deg, var(--energy), var(--energy-dark))",
                color: "#fff",
                boxShadow: "0 4px 14px var(--energy-glow)",
              }}
              onClick={() => {
                setMastery((prev) => ({ ...prev, [currentCard.term]: "learning" }));
                if (cardIndex < filteredWords.length - 1) {
                  setCardIndex((i) => i + 1);
                  setFlipped(false);
                }
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>&#128218;</span> Still Learning
            </button>
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between">
            <button
              className="btn btn-secondary"
              disabled={cardIndex === 0}
              onClick={() => {
                setCardIndex((i) => i - 1);
                setFlipped(false);
              }}
            >
              &#8592; Previous
            </button>
            <button
              className="btn btn-secondary"
              disabled={cardIndex === filteredWords.length - 1}
              onClick={() => {
                setCardIndex((i) => i + 1);
                setFlipped(false);
              }}
            >
              Next &#8594;
            </button>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           QUIZ MODE
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {mode === "quiz" && quizQuestions.length > 0 && (
        <div className="animate-in">
          {!quizDone ? (
            <>
              {/* Quiz Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[var(--foreground-muted)]">
                  Question {quizIndex + 1} of {quizQuestions.length}
                </span>
                {streak >= 2 && (
                  <div className="streak-badge-game">
                    <span className="streak-fire">&#128293;</span>
                    <span className="streak-count">{streak}</span>
                    <span className="streak-label">STREAK{streak >= 3 ? " x2" : ""}</span>
                  </div>
                )}
              </div>

              <div className="progress-bar mb-6">
                <div
                  className="progress-fill"
                  style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Current Question */}
              {(() => {
                const q = quizQuestions[quizIndex];
                const answered = quizAnswered[quizIndex] !== undefined;
                const isCorrect = quizCorrect[quizIndex];
                return (
                  <div className="card mb-4 animate-slide-up" key={quizIndex}>
                    <p className="text-lg font-bold mb-5">
                      What is the definition of{" "}
                      <span style={{ color: "var(--accent)" }}>&ldquo;{q.word.term}&rdquo;</span>?
                    </p>
                    <div className="grid gap-3 stagger-children">
                      {q.options.map((opt, oi) => {
                        let className = "quiz-option";
                        if (answered) {
                          if (opt === q.word.definition) className += " correct";
                          else if (opt === quizAnswered[quizIndex] && !isCorrect) className += " incorrect";
                        }
                        return (
                          <button
                            key={oi}
                            className={className}
                            onClick={() => handleQuizAnswer(quizIndex, opt)}
                            disabled={answered}
                          >
                            <span
                              className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0"
                              style={{
                                background: "var(--input-bg)",
                                border: "2px solid var(--card-border)",
                              }}
                            >
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="text-left">{opt}</span>
                            {answered && opt === q.word.definition && (
                              <span className="ml-auto text-xl" style={{ color: "var(--success)" }}>
                                &#10003;
                              </span>
                            )}
                            {answered &&
                              opt === quizAnswered[quizIndex] &&
                              !isCorrect &&
                              opt !== q.word.definition && (
                                <span className="ml-auto text-xl" style={{ color: "var(--error)" }}>
                                  &#10007;
                                </span>
                              )}
                          </button>
                        );
                      })}
                    </div>
                    {answered && !isCorrect && (
                      <p
                        className="mt-4 text-sm font-semibold animate-in"
                        style={{ color: "var(--energy)" }}
                      >
                        Keep going! You&apos;ll get the next one!
                      </p>
                    )}
                  </div>
                );
              })()}
            </>
          ) : (
            /* ── Quiz Results ── */
            <div className="card text-center animate-bounce-in">
              <h2 className="text-5xl font-black mb-2" style={{ color: "var(--accent)" }}>
                {quizScore}/{quizQuestions.length}
              </h2>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`star text-3xl ${i < starRating(quizScore, quizQuestions.length) ? "star-filled" : "star-empty"}`}
                  >
                    &#9733;
                  </span>
                ))}
              </div>

              <p className="text-lg font-bold mb-1">
                {quizScore === quizQuestions.length
                  ? "PERFECT SCORE!"
                  : quizScore >= quizQuestions.length * 0.7
                    ? "Great job!"
                    : "Keep practicing!"}
              </p>
              <p className="text-sm text-[var(--foreground-muted)] mb-6">
                {quizScore === quizQuestions.length
                  ? "You are a vocabulary master!"
                  : `You got ${quizScore} right out of ${quizQuestions.length}.`}
              </p>

              {/* Review list */}
              <div className="space-y-2 text-left mb-6">
                {quizQuestions.map((q, qi) => {
                  const correct = quizCorrect[qi];
                  return (
                    <div
                      key={qi}
                      className="p-3 rounded-xl flex items-center gap-3"
                      style={{
                        background: correct
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(239,68,68,0.1)",
                        border: `1px solid ${correct ? "var(--success)" : "var(--error)"}`,
                      }}
                    >
                      <span
                        className="text-lg font-bold"
                        style={{ color: correct ? "var(--success)" : "var(--error)" }}
                      >
                        {correct ? "\u2713" : "\u2717"}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{q.word.term}</p>
                        {!correct && (
                          <p className="text-xs text-[var(--foreground-muted)]">
                            {q.word.definition}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn btn-primary flex-1" onClick={() => startQuiz()}>
                  Play Again
                </button>
                {missedWords.length > 0 && (
                  <button
                    className="btn btn-danger flex-1"
                    onClick={() => {
                      startQuiz(missedWords);
                    }}
                  >
                    <span>&#128218;</span> Review Missed Words ({missedWords.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           FILL-IN-THE-BLANK MODE
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {mode === "fill" && fillQuestions.length > 0 && (
        <div className="animate-in">
          {!fillDone ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[var(--foreground-muted)]">
                  Word {fillIndex + 1} of {fillQuestions.length}
                </span>
                <span className="xp-badge text-xs">
                  <span>$</span> ${(fillScore / 100).toFixed(2)}
                </span>
              </div>
              <div className="progress-bar mb-6">
                <div
                  className="progress-fill"
                  style={{ width: `${((fillIndex + 1) / fillQuestions.length) * 100}%` }}
                />
              </div>

              {(() => {
                const word = fillQuestions[fillIndex];
                if (!word) return null;
                const sentence = word.example
                  ? blankOutWord(word.example, word.term)
                  : `The word means: ${word.definition}`;
                return (
                  <div className="card mb-4" key={fillIndex}>
                    <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-2 font-bold">
                      Fill in the blank
                    </p>
                    <p className="text-lg sm:text-xl font-semibold mb-2 leading-relaxed">
                      {sentence}
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)] mb-5 italic">
                      Hint: {word.definition}
                    </p>

                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={fillInput}
                        onChange={(e) => setFillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && fillInput.trim() && !fillResult) handleFillSubmit();
                        }}
                        placeholder="Type the word..."
                        className="flex-1"
                        disabled={fillResult !== null}
                        autoFocus
                        style={{
                          borderColor:
                            fillResult === "correct"
                              ? "var(--success)"
                              : fillResult === "wrong"
                                ? "var(--error)"
                                : undefined,
                          fontSize: "1.1rem",
                        }}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={handleFillSubmit}
                        disabled={!fillInput.trim() || fillResult !== null}
                      >
                        Check
                      </button>
                    </div>

                    {!fillResult && !fillHintUsed && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleFillHint}
                      >
                        <span>&#128161;</span> Hint (first letter) &mdash; reduces reward
                      </button>
                    )}
                    {fillHintUsed && !fillResult && (
                      <p className="text-sm text-[var(--foreground-muted)]">
                        Starts with: <span className="font-bold text-[var(--accent)]">{fillQuestions[fillIndex].term[0].toUpperCase()}</span>
                      </p>
                    )}

                    {fillResult === "correct" && (
                      <div
                        className="mt-4 p-3 rounded-xl font-bold animate-bounce-in"
                        style={{
                          background: "rgba(34,197,94,0.12)",
                          border: "1px solid var(--success)",
                          color: "var(--success)",
                        }}
                      >
                        &#10003; Correct! The word is &ldquo;{word.term}&rdquo;
                      </div>
                    )}
                    {fillResult === "wrong" && (
                      <div
                        className="mt-4 p-3 rounded-xl font-bold animate-shake"
                        style={{
                          background: "rgba(239,68,68,0.12)",
                          border: "1px solid var(--error)",
                          color: "var(--error)",
                        }}
                      >
                        &#10007; The answer was &ldquo;{word.term}&rdquo; &mdash; keep going!
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          ) : (
            /* ── Fill Results ── */
            <div className="card text-center animate-bounce-in">
              <h2 className="text-5xl font-black mb-2" style={{ color: "var(--accent)" }}>
                ${(fillScore / 100).toFixed(2)}
              </h2>
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`star text-3xl ${i < starRating(fillScore, fillQuestions.length * 10) ? "star-filled" : "star-empty"}`}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
              <p className="text-lg font-bold mb-1">
                {fillScore === fillQuestions.length * 10
                  ? "PERFECT!"
                  : fillScore >= fillQuestions.length * 7
                    ? "Great work!"
                    : "Keep at it!"}
              </p>
              <p className="text-sm text-[var(--foreground-muted)] mb-6">
                {fillQuestions.length - fillMissed.length} of {fillQuestions.length} words correct
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn btn-primary flex-1" onClick={() => startFill()}>
                  Play Again
                </button>
                {fillMissed.length > 0 && (
                  <button
                    className="btn btn-danger flex-1"
                    onClick={() => startFill(fillMissed)}
                  >
                    <span>&#128218;</span> Review Missed ({fillMissed.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {filteredWords.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-xl font-bold mb-2">No words found</p>
          <p className="text-[var(--foreground-muted)]">Try selecting a different lesson.</p>
        </div>
      )}
    </div>
  );
}
