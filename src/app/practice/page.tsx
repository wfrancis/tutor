"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRACTICE_MODES = [
  {
    id: "vocab",
    icon: "\uD83C\uDFD2",
    label: "Vocab Power Play",
    description: "Score goals with definitions, context clues, and word usage",
    difficulty: "Medium",
    time: "10 min",
    color: "#00d4aa",
    glow: "rgba(0, 212, 170, 0.3)",
    prompt:
      "Help me practice vocabulary words from my tutoring lessons. Quiz me on definitions, usage in context, and help me use them in sentences. Use examples from hockey, fishing, the outdoors, and Arctic exploration when possible. Ask me ONE question at a time and wait for my answer before moving on.",
  },
  {
    id: "reading",
    icon: "\u2744\uFE0F",
    label: "Reading Expedition",
    description: "Explore passages about nature, adventure, and more",
    difficulty: "Medium",
    time: "15 min",
    color: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.3)",
    prompt:
      "Give me a short reading passage appropriate for standardized test prep and ask me ONE comprehension question about it. Wait for my answer before asking the next question. When possible, choose topics I'd enjoy: Arctic exploration, wildlife, hockey history, fishing, outdoor adventure, or nature/science.",
  },
  {
    id: "literary",
    icon: "\uD83C\uDFAD",
    label: "Literary Devices",
    description: "Spot metaphors, similes, and imagery in the wild",
    difficulty: "Hard",
    time: "10 min",
    color: "#ff6b35",
    glow: "rgba(255, 107, 53, 0.3)",
    prompt:
      "Help me practice identifying and understanding literary devices like metaphor, simile, imagery, personification, alliteration, hyperbole, and onomatopoeia. Use examples from sports, nature, and adventure when possible. Give me ONE example at a time and quiz me on it. Wait for my answer before moving on.",
  },
  {
    id: "grammar",
    icon: "\u270D\uFE0F",
    label: "Grammar & Writing",
    description: "Sharpen your sentences like sharpening your skates",
    difficulty: "Medium",
    time: "10 min",
    color: "#7c3aed",
    glow: "rgba(124, 58, 237, 0.3)",
    prompt:
      "Help me practice grammar and writing skills for standardized tests. Cover things like sentence structure, punctuation, word choice, and paragraph organization. Use sports and nature themed sentences when possible. Ask me ONE question at a time and wait for my answer before moving on.",
  },
  {
    id: "test",
    icon: "\uD83C\uDFAF",
    label: "Test Day Shootout",
    description: "Face real standardized test questions \u2014 game time",
    difficulty: "Hard",
    time: "20 min",
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.3)",
    prompt:
      "Give me ONE practice question at a time in the style of standardized English tests (ISEE, SSAT, ACT, SAT). It can be multiple choice reading comprehension, vocabulary in context, or text analysis. When possible, use content related to hockey, nature, Arctic exploration, or outdoor adventure. Wait for my answer before giving the next question.",
  },
];

const QUICK_REPLIES = [
  { text: "Quiz me!", icon: "\uD83C\uDFAF", color: "#00d4aa" },
  { text: "Explain more", icon: "\uD83D\uDCA1", color: "#f59e0b" },
  { text: "Next question", icon: "\u27A1\uFE0F", color: "#3b82f6" },
  { text: "Harder please", icon: "\uD83D\uDD25", color: "#ef4444" },
  { text: "Give me a hint", icon: "\uD83E\uDD14", color: "#7c3aed" },
  { text: "I don't get it", icon: "\uD83D\uDE15", color: "#ff6b35" },
  { text: "Hat trick! 3 more", icon: "\uD83C\uDFC6", color: "#00d4aa" },
];

const DIFFICULTY_DOTS: Record<string, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

/* ═══════════════════════════════════════════
   Markdown-lite renderer:
   - **bold** text
   - (A) (B) (C) (D) answer options as tappable visual cards
   ═══════════════════════════════════════════ */

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong
        key={`b-${match.index}`}
        style={{ color: "#ffffff", fontWeight: 700 }}
      >
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function renderContent(text: string, modeColor: string): ReactNode {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    // Detect multiple choice options: (A), A), A., etc.
    const optionMatch = line.match(/^\s*\(?([A-Da-d])\)?[.)]\s*(.+)/);

    if (optionMatch) {
      const letter = optionMatch[1].toUpperCase();
      const optionText = optionMatch[2];
      elements.push(
        <div
          key={`opt-${lineIdx}`}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "12px 14px",
            marginTop: 6,
            marginBottom: 6,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${modeColor}, ${modeColor}cc)`,
              color: "#0b1120",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
              boxShadow: `0 2px 8px ${modeColor}40`,
            }}
          >
            {letter}
          </span>
          <span style={{ paddingTop: 5, lineHeight: 1.5 }}>
            {renderInlineMarkdown(optionText)}
          </span>
        </div>
      );
      return;
    }

    // Regular line
    if (lineIdx > 0) elements.push(<br key={`br-${lineIdx}`} />);
    elements.push(
      <span key={`ln-${lineIdx}`}>{renderInlineMarkdown(line)}</span>
    );
  });

  return <>{elements}</>;
}

/* ═══════════════════════════════════════════
   Animated message wrapper - slide + fade in
   ═══════════════════════════════════════════ */
function AnimatedMessage({
  children,
  fromRight = false,
}: {
  children: ReactNode;
  fromRight?: boolean;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transform: show
          ? "translateY(0) translateX(0)"
          : `translateY(10px) translateX(${fromRight ? "12px" : "-12px"})`,
        transition:
          "opacity 0.3s ease, transform 0.35s cubic-bezier(.4,0,.2,1)",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════ */
export default function PracticePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [pressedReply, setPressedReply] = useState<string | null>(null);
  const [sendPop, setSendPop] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Track question count
  useEffect(() => {
    const qCount = messages.filter(
      (m) => m.role === "assistant" && m.content.includes("?")
    ).length;
    setSessionQuestions(qCount);
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string, resetMessages?: boolean) => {
      setSendPop(true);
      setTimeout(() => setSendPop(false), 250);

      const userMessage: Message = { role: "user", content };
      const baseMessages = resetMessages ? [] : messages;
      const newMessages = [...baseMessages, userMessage];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      if (!resetMessages) {
        setSessionStreak((s) => s + 1);
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });
        const data = await res.json();
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.response },
        ]);
      } catch {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Try again!",
          },
        ]);
      }
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [messages]
  );

  function startMode(mode: (typeof PRACTICE_MODES)[0]) {
    setSelectedMode(mode.id);
    setSessionQuestions(0);
    setSessionStreak(0);
    sendMessage(mode.prompt, true);
  }

  function goBackToModes() {
    setMessages([]);
    setSelectedMode(null);
    setSessionQuestions(0);
    setSessionStreak(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  }

  const currentMode = PRACTICE_MODES.find((m) => m.id === selectedMode);
  const modeColor = currentMode?.color || "#00d4aa";
  const modeGlow = currentMode?.glow || "rgba(0, 212, 170, 0.3)";
  const showModeSelector = !selectedMode && messages.length === 0;

  // Skip the system prompt from visible messages
  const visibleMessages = messages.filter(
    (_, i) => i > 0 || !selectedMode
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b1120",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ═══════════════════════════════════════════════
          MODE SELECTION - Game Level Select Screen
          ═══════════════════════════════════════════════ */}
      {showModeSelector && (
        <div
          style={{
            maxWidth: 540,
            margin: "0 auto",
            padding: "20px 16px 120px",
            width: "100%",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 50,
                fontSize: 11,
                fontWeight: 800,
                backgroundColor: "rgba(0, 212, 170, 0.12)",
                color: "#00d4aa",
                border: "1px solid rgba(0, 212, 170, 0.25)",
                marginBottom: 14,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              {"\u26A1"} AI Practice Arena
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#f1f5f9",
                letterSpacing: -0.5,
                marginBottom: 6,
                lineHeight: 1.15,
              }}
            >
              Pick a Drill,{" "}
              <span style={{ color: "#00d4aa" }}>Drop the Puck</span>
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
              Go 1-on-1 with Coach Frost
            </p>
          </div>

          {/* Mode Cards - full width, stacked like game levels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PRACTICE_MODES.map((mode) => {
              const dots = DIFFICULTY_DOTS[mode.difficulty] || 2;
              const isPressed = pressedCard === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => startMode(mode)}
                  onPointerDown={() => setPressedCard(mode.id)}
                  onPointerUp={() => setPressedCard(null)}
                  onPointerLeave={() => setPressedCard(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 18px",
                    borderRadius: 18,
                    backgroundColor: "#1a2332",
                    border: `2px solid ${isPressed ? mode.color : "#2a3a4e"}`,
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.15s ease",
                    transform: isPressed ? "scale(0.97)" : "scale(1)",
                    boxShadow: isPressed
                      ? `0 0 24px ${mode.glow}, inset 0 0 30px ${mode.glow}`
                      : "0 2px 8px rgba(0,0,0,0.25)",
                    minHeight: 86,
                  }}
                >
                  {/* Left accent stripe */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      backgroundColor: mode.color,
                    }}
                  />

                  {/* Icon */}
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      background: `linear-gradient(135deg, ${mode.color}25, ${mode.color}08)`,
                      border: `1px solid ${mode.color}35`,
                      flexShrink: 0,
                      transition: "transform 0.15s ease",
                      transform: isPressed
                        ? "scale(1.1) rotate(-5deg)"
                        : "scale(1)",
                    }}
                  >
                    {mode.icon}
                  </div>

                  {/* Text content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#f1f5f9",
                        marginBottom: 3,
                        letterSpacing: -0.2,
                      }}
                    >
                      {mode.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        lineHeight: 1.35,
                        marginBottom: 6,
                      }}
                    >
                      {mode.description}
                    </div>
                    {/* Difficulty + time */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {Array.from({ length: 3 }, (_, i) => (
                          <div
                            key={i}
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              backgroundColor:
                                i < dots
                                  ? mode.color
                                  : "rgba(255,255,255,0.08)",
                              boxShadow:
                                i < dots
                                  ? `0 0 4px ${mode.color}50`
                                  : "none",
                            }}
                          />
                        ))}
                        <span
                          style={{
                            fontSize: 10,
                            color: "#64748b",
                            fontWeight: 700,
                            marginLeft: 3,
                          }}
                        >
                          {mode.difficulty}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          fontWeight: 700,
                        }}
                      >
                        {"\u23F1"} {mode.time}
                      </span>
                    </div>
                  </div>

                  {/* Play button */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      backgroundColor: `${mode.color}18`,
                      border: `2px solid ${mode.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: mode.color,
                      fontSize: 13,
                      fontWeight: 900,
                      transition: "all 0.15s ease",
                      transform: isPressed ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    {"\u25B6"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          CHAT INTERFACE
          ═══════════════════════════════════════════════ */}
      {!showModeSelector && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            maxWidth: 640,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Session Header / Scoreboard */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid #2a3a4e",
              backgroundColor: "rgba(15, 23, 41, 0.95)",
              backdropFilter: "blur(12px)",
              flexShrink: 0,
              position: "sticky",
              top: 0,
              zIndex: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              {/* Back button */}
              <button
                onClick={goBackToModes}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "9px 14px",
                  borderRadius: 12,
                  backgroundColor: "#1a2332",
                  border: "1px solid #2a3a4e",
                  color: "#94a3b8",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  flexShrink: 0,
                  minHeight: 44,
                  minWidth: 44,
                  transition: "all 0.15s ease",
                }}
              >
                {"\u2190"} Modes
              </button>

              {/* Coach + mode name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flex: 1,
                  justifyContent: "center",
                  minWidth: 0,
                }}
              >
                {/* Coach avatar */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${modeColor}, ${modeColor}aa)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                    boxShadow: `0 0 14px ${modeGlow}`,
                    position: "relative",
                  }}
                >
                  {currentMode?.icon || "\u2744\uFE0F"}
                  {/* Online dot */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: loading ? "#fbbf24" : "#22c55e",
                      border: "2px solid #0b1120",
                    }}
                  />
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#f1f5f9",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.2,
                    }}
                  >
                    Coach Frost
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: modeColor,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {loading
                      ? "Thinking..."
                      : currentMode?.label || "Practice"}
                  </div>
                </div>
              </div>

              {/* Session stats */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {/* Question counter */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "4px 10px",
                    borderRadius: 10,
                    backgroundColor: `${modeColor}12`,
                    border: `1px solid ${modeColor}30`,
                    minWidth: 44,
                    minHeight: 44,
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: modeColor,
                      lineHeight: 1,
                    }}
                  >
                    {sessionQuestions}
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      color: "#64748b",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Q&apos;s
                  </span>
                </div>

                {/* Streak badge */}
                {sessionStreak > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "4px 10px",
                      borderRadius: 10,
                      backgroundColor: "rgba(255, 107, 53, 0.1)",
                      border: "1px solid rgba(255, 107, 53, 0.25)",
                      minWidth: 44,
                      minHeight: 44,
                      justifyContent: "center",
                      animation:
                        sessionStreak >= 5
                          ? "streak-glow 1.5s infinite ease-in-out"
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 900,
                        color: "#ff6b35",
                        lineHeight: 1,
                      }}
                    >
                      {sessionStreak}
                    </span>
                    <span style={{ fontSize: 8, lineHeight: 1 }}>
                      {"\uD83D\uDD25"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                marginTop: 8,
                height: 3,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${Math.min(sessionQuestions * 10, 100)}%`,
                  background: `linear-gradient(90deg, ${modeColor}, ${modeColor}cc)`,
                  transition: "width 0.5s ease",
                  boxShadow: `0 0 8px ${modeGlow}`,
                }}
              />
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minHeight: 200,
              maxHeight: "calc(100vh - 320px)",
              scrollbarWidth: "thin",
              scrollbarColor: "#2a3a4e transparent",
            }}
          >
            {visibleMessages.map((msg, i) => {
              const isUser = msg.role === "user";
              const isLatest = i === visibleMessages.length - 1;

              return (
                <AnimatedMessage key={i} fromRight={isUser}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    {/* Coach avatar */}
                    {!isUser && (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: `linear-gradient(135deg, #1e3a5f, ${modeColor})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          flexShrink: 0,
                          boxShadow: `0 2px 10px ${modeGlow}`,
                        }}
                      >
                        {"\u2744\uFE0F"}
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: "82%",
                        borderRadius: 18,
                        padding: isUser ? "12px 16px" : "14px 18px",
                        fontSize: 15,
                        lineHeight: 1.6,
                        ...(isUser
                          ? {
                              background: `linear-gradient(135deg, ${modeColor}, ${modeColor}cc)`,
                              color: "#0b1120",
                              borderBottomRightRadius: 6,
                              fontWeight: 600,
                              boxShadow: `0 3px 12px ${modeGlow}`,
                            }
                          : {
                              backgroundColor: "#1a2332",
                              color: "#e2e8f0",
                              border: isLatest
                                ? `1px solid ${modeColor}40`
                                : "1px solid #2a3a4e",
                              borderBottomLeftRadius: 6,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            }),
                      }}
                    >
                      {!isUser && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: 1.2,
                            color: modeColor,
                            marginBottom: 6,
                          }}
                        >
                          Coach Frost
                        </div>
                      )}
                      {isUser
                        ? msg.content
                        : renderContent(msg.content, modeColor)}
                    </div>
                  </div>
                </AnimatedMessage>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <AnimatedMessage>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, #1e3a5f, ${modeColor})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                      animation: "coach-bob 1.5s infinite ease-in-out",
                    }}
                  >
                    {"\u2744\uFE0F"}
                  </div>
                  <div
                    style={{
                      borderRadius: 18,
                      padding: "16px 22px",
                      backgroundColor: "#1a2332",
                      border: `1px solid ${modeColor}30`,
                      borderBottomLeftRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      {[0, 0.2, 0.4].map((delay, idx) => (
                        <span
                          key={idx}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: modeColor,
                            display: "inline-block",
                            animation: `bounce-dot 1.4s infinite ease-in-out ${delay}s`,
                            opacity: 0.6,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedMessage>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies - 2-column grid, big tappable buttons */}
          {!loading && visibleMessages.length > 0 && (
            <div
              style={{
                padding: "8px 14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                flexShrink: 0,
                borderTop: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {QUICK_REPLIES.map((reply) => {
                const isPressed = pressedReply === reply.text;
                return (
                  <button
                    key={reply.text}
                    onClick={() => sendMessage(reply.text)}
                    onPointerDown={() => setPressedReply(reply.text)}
                    onPointerUp={() => setPressedReply(null)}
                    onPointerLeave={() => setPressedReply(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "12px 10px",
                      borderRadius: 14,
                      backgroundColor: isPressed
                        ? `${reply.color}20`
                        : "#1a2332",
                      border: `1.5px solid ${
                        isPressed ? reply.color : "#2a3a4e"
                      }`,
                      color: isPressed ? reply.color : "#cfd8dc",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.12s ease",
                      transform: isPressed ? "scale(0.95)" : "scale(1)",
                      minHeight: 48,
                      boxShadow: isPressed
                        ? `0 0 12px ${reply.color}25`
                        : "none",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{reply.icon}</span>
                    {reply.text}
                  </button>
                );
              })}
            </div>
          )}

          {/* Input Area - Bottom anchored */}
          <div
            style={{
              padding: "12px 14px 16px",
              flexShrink: 0,
              backgroundColor: "#0b1120",
              borderTop: "1px solid #1a2332",
              position: "sticky",
              bottom: 0,
              zIndex: 20,
              paddingBottom:
                "max(16px, env(safe-area-inset-bottom, 16px))",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 600,
                  border: `2px solid ${
                    input.trim() ? modeColor : "#2a3a4e"
                  }`,
                  backgroundColor: "#111827",
                  color: "#f1f5f9",
                  caretColor: modeColor,
                  outline: "none",
                  transition:
                    "border-color 0.2s ease, box-shadow 0.2s ease",
                  minHeight: 52,
                  fontFamily: "inherit",
                  boxShadow: input.trim()
                    ? `0 0 16px ${modeGlow}`
                    : "none",
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background:
                    !input.trim() || loading
                      ? "#2a3a4e"
                      : `linear-gradient(135deg, ${modeColor}, ${modeColor}cc)`,
                  color:
                    !input.trim() || loading ? "#64748b" : "#0b1120",
                  border: "none",
                  cursor:
                    !input.trim() || loading
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 900,
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                  transform: sendPop ? "scale(0.8)" : "scale(1)",
                  boxShadow:
                    input.trim() && !loading
                      ? `0 4px 16px ${modeGlow}`
                      : "none",
                }}
              >
                {"\u2191"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Keyframe Animations */}
      <style jsx>{`
        @keyframes bounce-dot {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          40% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
        @keyframes coach-bob {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
        @keyframes streak-glow {
          0%,
          100% {
            box-shadow: 0 0 4px rgba(255, 107, 53, 0.2);
          }
          50% {
            box-shadow: 0 0 16px rgba(255, 107, 53, 0.5);
          }
        }
      `}</style>
    </div>
  );
}
