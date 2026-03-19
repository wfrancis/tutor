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

interface GameState {
  xp: number;
  streak: number;
  level: number;
  wordsmastered: number;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

const GameStateContext = createContext<GameState | null>(null);

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used within GameStateProvider");
  return ctx;
}

function calculateLevel(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordsmastered, setWordsMastered] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("english-quest-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setXP(parsed.xp ?? 0);
        setStreak(parsed.streak ?? 0);
        setWordsMastered(parsed.wordsmastered ?? 0);
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
        JSON.stringify({ xp, streak, wordsmastered })
      );
    }
  }, [xp, streak, wordsmastered, loaded]);

  const addXP = useCallback((amount: number) => setXP((prev) => prev + amount), []);
  const incrementStreak = useCallback(() => setStreak((prev) => prev + 1), []);
  const resetStreak = useCallback(() => setStreak(0), []);

  const level = calculateLevel(xp);

  return (
    <GameStateContext.Provider
      value={{ xp, streak, level, wordsmastered, addXP, incrementStreak, resetStreak }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

/* =============================================
   XPCounter — Animated XP display with bolt icon
   Shows +XP animation when value changes
   ============================================= */

export function XPCounter({ xp: xpProp }: { xp?: number } = {}) {
  const ctx = useContext(GameStateContext);
  const xp = xpProp ?? ctx?.xp ?? 0;

  const prevXPRef = useRef(xp);
  const [delta, setDelta] = useState(0);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    const diff = xp - prevXPRef.current;
    if (diff > 0) {
      setDelta(diff);
      setBumping(true);
      const timer = setTimeout(() => {
        setDelta(0);
        setBumping(false);
      }, 1000);
      prevXPRef.current = xp;
      return () => clearTimeout(timer);
    }
    prevXPRef.current = xp;
  }, [xp]);

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <div
        className={`xp-badge ${bumping ? "animate-xp-bump" : ""}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
        <span>{xp.toLocaleString()} XP</span>
      </div>
      {delta > 0 && (
        <span
          className="absolute -top-3 -right-2 text-sm font-extrabold animate-float-up pointer-events-none"
          style={{ color: "var(--accent)" }}
        >
          +{delta}
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
   LevelBadge — Level indicator with title
   ============================================= */

const LEVEL_TITLES: Record<number, string> = {
  1: "Beginner",
  2: "Explorer",
  3: "Adventurer",
  4: "Warrior",
  5: "Champion",
  6: "Hero",
  7: "Legend",
  8: "Master",
  9: "Grandmaster",
  10: "Mythic",
};

function defaultTitle(level: number): string {
  return LEVEL_TITLES[level] ?? `Level ${level}`;
}

export function LevelBadge({
  level,
  title,
}: {
  level: number;
  title?: string;
}) {
  const displayTitle = title ?? defaultTitle(level);

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
      <span>LV {level}</span>
      <span className="opacity-80 text-xs font-semibold hidden sm:inline">
        {displayTitle}
      </span>
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
   PointsPopup — "+10 XP" float-up animation
   ============================================= */

export function PointsPopup({
  points,
  show,
}: {
  points: number;
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
        +{points} XP
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
