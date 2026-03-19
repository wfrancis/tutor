"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";

/* =============================================
   Game State — Context + Provider
   ============================================= */

interface CashIn {
  checkNumber: number;
  amountCents: number;
  date: string;
}

interface GameState {
  balanceCents: number;
  totalEarnedCents: number;
  streak: number;
  wordsmastered: number;
  cashInHistory: CashIn[];
  nextCheckNumber: number;
  addEarnings: (cents: number) => void;
  cashIn: (amountCents: number) => CashIn;
  incrementStreak: () => void;
  resetStreak: () => void;
}

const GameStateContext = createContext<GameState | null>(null);

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used within GameStateProvider");
  return ctx;
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [balanceCents, setBalanceCents] = useState(0);
  const [totalEarnedCents, setTotalEarnedCents] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordsmastered, setWordsMastered] = useState(0);
  const [cashInHistory, setCashInHistory] = useState<CashIn[]>([]);
  const [nextCheckNumber, setNextCheckNumber] = useState(1001);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("english-quest-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: if old xp-based data, start fresh
        if ("xp" in parsed) {
          // start fresh — all zeros
        } else {
          setBalanceCents(parsed.balanceCents ?? 0);
          setTotalEarnedCents(parsed.totalEarnedCents ?? 0);
          setStreak(parsed.streak ?? 0);
          setWordsMastered(parsed.wordsmastered ?? 0);
          setCashInHistory(parsed.cashInHistory ?? []);
          setNextCheckNumber(parsed.nextCheckNumber ?? 1001);
        }
      } catch {
        /* corrupted state — start fresh */
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(
        "english-quest-state",
        JSON.stringify({
          balanceCents,
          totalEarnedCents,
          streak,
          wordsmastered,
          cashInHistory,
          nextCheckNumber,
        })
      );
    }
  }, [balanceCents, totalEarnedCents, streak, wordsmastered, cashInHistory, nextCheckNumber, loaded]);

  const addEarnings = useCallback((cents: number) => {
    setBalanceCents((prev) => prev + cents);
    setTotalEarnedCents((prev) => prev + cents);
  }, []);

  const cashInFn = useCallback(
    (amountCents: number): CashIn => {
      const record: CashIn = {
        checkNumber: nextCheckNumber,
        amountCents,
        date: new Date().toISOString(),
      };
      setBalanceCents((prev) => prev - amountCents);
      setNextCheckNumber((prev) => prev + 1);
      setCashInHistory((prev) => [...prev, record]);
      return record;
    },
    [nextCheckNumber]
  );

  const incrementStreak = useCallback(() => setStreak((prev) => prev + 1), []);
  const resetStreak = useCallback(() => setStreak(0), []);

  return (
    <GameStateContext.Provider
      value={{
        balanceCents,
        totalEarnedCents,
        streak,
        wordsmastered,
        cashInHistory,
        nextCheckNumber,
        addEarnings,
        cashIn: cashInFn,
        incrementStreak,
        resetStreak,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

/* =============================================
   BalanceDisplay — Animated dollar balance display
   Shows +$X.XX animation when value changes
   ============================================= */

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BalanceDisplay({ balanceCents: balanceProp }: { balanceCents?: number } = {}) {
  const ctx = useContext(GameStateContext);
  const balanceCents = balanceProp ?? ctx?.balanceCents ?? 0;

  const prevRef = useRef(balanceCents);
  const [delta, setDelta] = useState(0);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    const diff = balanceCents - prevRef.current;
    if (diff > 0) {
      setDelta(diff);
      setBumping(true);
      const timer = setTimeout(() => {
        setDelta(0);
        setBumping(false);
      }, 1000);
      prevRef.current = balanceCents;
      return () => clearTimeout(timer);
    }
    prevRef.current = balanceCents;
  }, [balanceCents]);

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <div
        className={`xp-badge ${bumping ? "animate-xp-bump" : ""}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="currentColor"
            stroke="none"
          >
            $
          </text>
        </svg>
        <span>{formatCents(balanceCents)}</span>
      </div>
      {delta > 0 && (
        <span
          className="absolute -top-3 -right-2 text-sm font-extrabold animate-float-up pointer-events-none"
          style={{ color: "var(--accent)" }}
        >
          +{formatCents(delta)}
        </span>
      )}
    </div>
  );
}

/* =============================================
   StreakBadge — Fire emoji streak counter
   ============================================= */

export function StreakBadge({ days: daysProp }: { days?: number } = {}) {
  const ctx = useContext(GameStateContext);
  const days = daysProp ?? ctx?.streak ?? 0;

  return (
    <div className="streak-badge-game">
      <span className="streak-fire" role="img" aria-label="fire">
        🔥
      </span>
      <span className="streak-count">{days}</span>
      <span className="streak-label">day{days !== 1 ? "s" : ""}</span>
    </div>
  );
}

/* =============================================
   MilestoneBadge — Earnings milestone indicator
   ============================================= */

const MILESTONES = [
  { threshold: 0, title: "Getting Started" },
  { threshold: 100, title: "First Dollar!" },
  { threshold: 500, title: "$5 Club" },
  { threshold: 1000, title: "$10 Earner" },
  { threshold: 2500, title: "$25 Pro" },
  { threshold: 5000, title: "$50 Legend" },
  { threshold: 10000, title: "$100 Master" },
];

export function MilestoneBadge({
  totalEarnedCents: totalProp,
}: {
  totalEarnedCents?: number;
}) {
  const ctx = useContext(GameStateContext);
  const totalEarnedCents = totalProp ?? ctx?.totalEarnedCents ?? 0;

  // Find current milestone
  let currentMilestone = MILESTONES[0];
  let nextMilestone: (typeof MILESTONES)[number] | null = null;
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (totalEarnedCents >= MILESTONES[i].threshold) {
      currentMilestone = MILESTONES[i];
      nextMilestone = MILESTONES[i + 1] ?? null;
      break;
    }
  }

  const progressToNext = nextMilestone
    ? Math.round(
        ((totalEarnedCents - currentMilestone.threshold) /
          (nextMilestone.threshold - currentMilestone.threshold)) *
          100
      )
    : 100;

  return (
    <div className="level-badge">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span>{currentMilestone.title}</span>
      {nextMilestone && (
        <span className="opacity-80 text-xs font-semibold hidden sm:inline">
          {progressToNext}% to {nextMilestone.title}
        </span>
      )}
    </div>
  );
}

/* =============================================
   ProgressRing — Circular SVG progress indicator
   ============================================= */

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  color,
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--card-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color ?? "var(--accent)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
          style={
            {
              "--ring-circumference": circumference,
              "--ring-offset": offset,
            } as React.CSSProperties
          }
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (
          <span
            className="text-sm font-bold"
            style={{ color: color ?? "var(--accent)" }}
          >
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
    </div>
  );
}

/* =============================================
   ScoreDisplay — Score with animated star rating
   ============================================= */

function getStarCount(correct: number, total: number): number {
  if (total === 0) return 0;
  const pct = (correct / total) * 100;
  if (pct >= 100) return 5;
  if (pct >= 80) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  if (pct > 0) return 1;
  return 0;
}

export function ScoreDisplay({
  correct,
  total,
}: {
  correct: number;
  total: number;
}) {
  const stars = getStarCount(correct, total);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-3 animate-bounce-in">
      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`star text-2xl ${i <= stars ? "star-filled" : "star-empty"}`}
            style={{
              animation: i <= stars ? `star-pop 0.4s ease ${i * 0.1}s forwards` : "none",
              opacity: i <= stars ? 0 : 1,
              ...(i <= stars ? {} : {}),
            }}
          >
            {i <= stars ? "\u2605" : "\u2606"}
          </span>
        ))}
      </div>
      {/* Score text */}
      <div className="text-center">
        <div className="text-3xl font-extrabold" style={{ color: "var(--accent)" }}>
          {correct}/{total}
        </div>
        <div className="text-sm font-semibold" style={{ color: "var(--foreground-muted)" }}>
          {pct}% correct
        </div>
      </div>
    </div>
  );
}

/* =============================================
   Celebration — Confetti overlay for perfect scores
   ============================================= */

const CONFETTI_COLORS = [
  "var(--accent)",
  "var(--energy)",
  "var(--special)",
  "var(--success)",
  "var(--warning)",
  "#ff69b4",
  "#00bfff",
];

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  shape: "square" | "circle" | "strip";
}

export function Celebration() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const generated: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      shape: (["square", "circle", "strip"] as const)[Math.floor(Math.random() * 3)],
    }));
    setPieces(generated);

    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Confetti pieces */}
      <div className="confetti-container" aria-hidden="true">
        {pieces.map((p) => (
          <div
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: p.shape === "strip" ? p.size * 0.4 : p.size,
              height: p.shape === "strip" ? p.size * 1.8 : p.size,
              borderRadius: p.shape === "circle" ? "50%" : "2px",
            }}
          />
        ))}
      </div>
      {/* Center text */}
      <div className="celebration-overlay">
        <div className="celebration-text">PERFECT!</div>
        <div className="celebration-subtitle">You nailed every question!</div>
      </div>
    </>
  );
}

/* =============================================
   EarningsPopup — "+$0.10" float-up animation
   ============================================= */

export function EarningsPopup({
  cents,
  show,
}: {
  cents: number;
  show: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setKey((k) => k + 1);
      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="points-popup" key={key}>
      <div
        className="text-3xl font-black tracking-tight"
        style={{
          color: "var(--accent)",
          textShadow: "0 0 20px var(--accent-glow)",
        }}
      >
        +{formatCents(cents)}
      </div>
    </div>
  );
}

/* =============================================
   DifficultySelector — Easy / Medium / Hard toggle
   ============================================= */

export type DifficultyLevel = "easy" | "medium" | "hard";

interface DifficultySelectorProps {
  level: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
}

const DIFFICULTY_CONFIG: {
  value: DifficultyLevel;
  label: string;
  emoji: string;
  activeClass: string;
}[] = [
  { value: "easy", label: "Easy", emoji: "🟢", activeClass: "active-easy" },
  { value: "medium", label: "Medium", emoji: "🟡", activeClass: "active-medium" },
  { value: "hard", label: "Hard", emoji: "🔴", activeClass: "active-hard" },
];

export function DifficultySelector({ level, onChange }: DifficultySelectorProps) {
  return (
    <div className="difficulty-selector" role="radiogroup" aria-label="Difficulty level">
      {DIFFICULTY_CONFIG.map(({ value, label, emoji, activeClass }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={level === value}
          className={`difficulty-option ${level === value ? activeClass : ""}`}
          onClick={() => onChange(value)}
        >
          <span aria-hidden="true">{emoji}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

/* =============================================
   numberToWords — Convert cents to written dollar form
   e.g. 1250 → "Twelve and 50/100 Dollars"
   Handles amounts up to $999.99
   ============================================= */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return TENS[ten] + (one ? "-" + ONES[one] : "");
}

function wholeNumberWords(n: number): string {
  if (n === 0) return "Zero";
  if (n < 20) return ONES[n];
  if (n < 100) return twoDigitWords(n);
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  return ONES[hundreds] + " Hundred" + (remainder ? " " + twoDigitWords(remainder) : "");
}

export function numberToWords(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const remainderCents = cents % 100;
  const centsStr = remainderCents.toString().padStart(2, "0");
  return `${wholeNumberWords(dollars)} and ${centsStr}/100 Dollars`;
}

/* =============================================
   CashInCheck — A printable bank check component
   ============================================= */

export function CashInCheck({
  checkNumber,
  amountCents,
  date,
}: {
  checkNumber: number;
  amountCents: number;
  date: string;
}) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="printable-check"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 600,
        padding: "32px 40px",
        background: "linear-gradient(135deg, #fdf8ef 0%, #faf3e3 50%, #f5edd6 100%)",
        border: "4px double #8b7355",
        borderRadius: 8,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          fontSize: 48,
          fontWeight: "bold",
          color: "rgba(139, 115, 85, 0.06)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          letterSpacing: 8,
          userSelect: "none",
        }}
      >
        FOR DEPOSIT ONLY
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 4,
            color: "#8b7355",
            marginBottom: 2,
            textTransform: "uppercase",
          }}
        >
          ★ ★ ★
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#3d2e1f",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Bank of Dad
        </div>
        <div style={{ fontSize: 9, color: "#8b7355", letterSpacing: 2, marginTop: 2 }}>
          ESTABLISHED FOR EDUCATIONAL EXCELLENCE
        </div>
      </div>

      {/* Check number */}
      <div
        style={{
          position: "absolute",
          top: 32,
          right: 40,
          fontSize: 14,
          color: "#8b7355",
          fontWeight: "bold",
        }}
      >
        #{checkNumber}
      </div>

      {/* Date */}
      <div style={{ textAlign: "right", marginBottom: 16, fontSize: 13, color: "#3d2e1f" }}>
        <span style={{ borderBottom: "1px solid #8b7355", paddingBottom: 2 }}>
          Date: {formattedDate}
        </span>
      </div>

      {/* Pay to the order of */}
      <div style={{ marginBottom: 14, fontSize: 13, color: "#3d2e1f" }}>
        <span style={{ fontWeight: "bold", textTransform: "uppercase", marginRight: 8 }}>
          Pay to the Order of:
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: "bold",
            borderBottom: "2px solid #3d2e1f",
            paddingBottom: 2,
            paddingLeft: 8,
            paddingRight: 24,
          }}
        >
          Cole
        </span>
        {/* Dollar amount box */}
        <span
          style={{
            float: "right",
            border: "2px solid #3d2e1f",
            padding: "4px 12px",
            fontSize: 16,
            fontWeight: "bold",
            background: "#fff",
            borderRadius: 4,
            minWidth: 80,
            textAlign: "center",
          }}
        >
          {formatCents(amountCents)}
        </span>
      </div>

      {/* Written amount */}
      <div
        style={{
          marginBottom: 20,
          fontSize: 13,
          color: "#3d2e1f",
          borderBottom: "1px solid #8b7355",
          paddingBottom: 6,
        }}
      >
        <span style={{ fontStyle: "italic" }}>{numberToWords(amountCents)}</span>
      </div>

      {/* Memo and signature */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 24,
        }}
      >
        <div style={{ fontSize: 11, color: "#8b7355" }}>
          <span style={{ fontWeight: "bold" }}>Memo:</span> English Practice Earnings
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              borderBottom: "1px solid #3d2e1f",
              width: 180,
              marginBottom: 4,
            }}
          />
          <div style={{ fontSize: 9, color: "#8b7355", letterSpacing: 1 }}>
            Authorized Signature
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   CashInModal — Modal to generate and print checks
   ============================================= */

export function CashInModal({ onClose }: { onClose: () => void }) {
  const { balanceCents, cashIn } = useGameState();
  const [amountCents, setAmountCents] = useState(balanceCents);
  const [generatedCheck, setGeneratedCheck] = useState<CashIn | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dollars = parseFloat(e.target.value);
    if (isNaN(dollars)) {
      setAmountCents(0);
    } else {
      setAmountCents(Math.min(Math.round(dollars * 100), balanceCents));
    }
  };

  const handleGenerate = () => {
    if (amountCents <= 0 || amountCents > balanceCents) return;
    const check = cashIn(amountCents);
    setGeneratedCheck(check);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          maxWidth: 680,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
            color: "#1a1a1a",
            textAlign: "center",
          }}
        >
          Cash In Your Earnings
        </h2>

        {!generatedCheck ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                Current Balance
              </div>
              <div style={{ fontSize: 36, fontWeight: "bold", color: "#1a7a1a" }}>
                {formatCents(balanceCents)}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="cashInAmount"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#333",
                }}
              >
                Amount to cash in:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>$</span>
                <input
                  id="cashInAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(balanceCents / 100).toFixed(2)}
                  value={(amountCents / 100).toFixed(2)}
                  onChange={handleAmountChange}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: 18,
                    border: "2px solid #ddd",
                    borderRadius: 8,
                    outline: "none",
                    color: "#333",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={handleGenerate}
                disabled={amountCents <= 0 || amountCents > balanceCents}
                style={{
                  padding: "12px 32px",
                  fontSize: 16,
                  fontWeight: "bold",
                  background: amountCents > 0 && amountCents <= balanceCents ? "#1a7a1a" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: amountCents > 0 && amountCents <= balanceCents ? "pointer" : "not-allowed",
                }}
              >
                Generate Check
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "12px 32px",
                  fontSize: 16,
                  fontWeight: "bold",
                  background: "#f0f0f0",
                  color: "#333",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <CashInCheck
                checkNumber={generatedCheck.checkNumber}
                amountCents={generatedCheck.amountCents}
                date={generatedCheck.date}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={handlePrint}
                style={{
                  padding: "12px 32px",
                  fontSize: 16,
                  fontWeight: "bold",
                  background: "#1a7a1a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Print Check
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "12px 32px",
                  fontSize: 16,
                  fontWeight: "bold",
                  background: "#f0f0f0",
                  color: "#333",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
