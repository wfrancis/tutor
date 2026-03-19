"use client";

import { useState } from "react";
import Link from "next/link";
import { useGameState, CashInModal } from "@/components/GameElements";

const MILESTONES = [
  { threshold: 0, title: "Rookie Season" },
  { threshold: 100, title: "First Assist!" },
  { threshold: 500, title: "$5 All-Star" },
  { threshold: 1000, title: "$10 Captain" },
  { threshold: 2500, title: "$25 MVP" },
  { threshold: 5000, title: "$50 Legend" },
  { threshold: 10000, title: "$100 Hall of Fame" },
];

function getMilestone(totalCents: number) {
  let current = MILESTONES[0];
  let next = MILESTONES[1];
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (totalCents >= MILESTONES[i].threshold) {
      current = MILESTONES[i];
      next = MILESTONES[i + 1] || null;
      break;
    }
  }
  return { current, next };
}

const skills = [
  { name: "Metaphor & Simile", progress: 70, icon: "\uD83C\uDFAD" },
  { name: "Vocabulary", progress: 45, icon: "\uD83D\uDCDD" },
  { name: "Reading Comp", progress: 55, icon: "\uD83D\uDCD6" },
  { name: "Poetry Analysis", progress: 40, icon: "\uD83C\uDFB5" },
  { name: "Literary Devices", progress: 60, icon: "\uD83D\uDD2C" },
  { name: "Context Clues", progress: 35, icon: "\uD83D\uDD0E" },
];

// Rotating greetings themed to Cole's interests
const GREETINGS = [
  { text: "Hey Cole!", emoji: "\uD83C\uDFD2" },           // hockey stick
  { text: "What's up Cole!", emoji: "\uD83C\uDFA3" },     // fishing
  { text: "Let's go Cole!", emoji: "\uD83C\uDFBF" },      // skiing
  { text: "Game time Cole!", emoji: "\uD83E\uDD85" },     // eagle
  { text: "Hey champ!", emoji: "\uD83D\uDC3B\u200D\u2744\uFE0F" }, // polar bear
];

const missions = [
  { title: "Vocab Hat Trick", path: "/vocabulary", type: "vocab", icon: "\uD83C\uDFD2", desc: "Score 3 vocab wins in a row" },
  { title: "Arctic Reading Expedition", path: "/reading", type: "reading", icon: "\u2744\uFE0F", desc: "Conquer a reading passage" },
  { title: "AI Shootout", path: "/practice", type: "practice", icon: "\uD83E\uDD16", desc: "Go 1-on-1 with the AI tutor" },
  { title: "Context Clue Fishing", path: "/vocabulary", type: "vocab", icon: "\uD83C\uDFA3", desc: "Reel in word meanings from context" },
  { title: "Reading Power Play", path: "/reading", type: "reading", icon: "\uD83D\uDCD6", desc: "Answer questions under pressure" },
];

function getDailyMission() {
  const today = new Date();
  const dayIndex =
    (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) %
    missions.length;
  return missions[dayIndex];
}

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Home() {
  const { balanceCents, totalEarnedCents, streak, wordsmastered } = useGameState();
  const [showCashIn, setShowCashIn] = useState(false);
  const dailyMission = getDailyMission();
  const { current: milestone, next: nextMilestone } = getMilestone(totalEarnedCents);
  const milestoneProgress = nextMilestone
    ? ((totalEarnedCents - milestone.threshold) / (nextMilestone.threshold - milestone.threshold)) * 100
    : 100;

  return (
    <div className="dashboard">
      {/* Cash In Modal */}
      {showCashIn && <CashInModal onClose={() => setShowCashIn(false)} />}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-greeting">
            <h1 className="hero-title">
              {(() => { const g = GREETINGS[new Date().getDay() % GREETINGS.length]; return <>{g.text} <span className="hero-wave">{g.emoji}</span></>; })()}
            </h1>
            <p className="hero-subtitle">Ready to hit the ice?</p>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-card hero-stat-level">
              <div className="hero-stat-icon">{"\uD83D\uDCB0"}</div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{formatDollars(balanceCents)}</span>
                <span className="hero-stat-label">Balance</span>
              </div>
            </div>
            <div className="hero-stat-card hero-stat-xp">
              <div className="hero-stat-icon">{"\uD83D\uDCB5"}</div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{formatDollars(totalEarnedCents)}</span>
                <span className="hero-stat-label">Total Earned</span>
              </div>
            </div>
            <div className="hero-stat-card hero-stat-streak">
              <div className="hero-stat-icon">{"\uD83D\uDD25"}</div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{streak}</span>
                <span className="hero-stat-label">Day Streak</span>
              </div>
            </div>
          </div>

          {/* Cash In Button */}
          {balanceCents > 0 && (
            <button
              onClick={() => setShowCashIn(true)}
              className="w-full mt-4 py-4 rounded-2xl font-extrabold text-lg text-white transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                boxShadow: "0 4px 20px rgba(22,163,74,0.4)",
              }}
            >
              {"\uD83D\uDCB8"} Cash In {formatDollars(balanceCents)}
            </button>
          )}

          <div className="hero-level-bar" style={{ marginTop: "1rem" }}>
            <div className="hero-level-info">
              <span className="hero-level-current">{milestone.title}</span>
              <span className="hero-level-progress">
                {nextMilestone
                  ? `${formatDollars(totalEarnedCents)} / ${formatDollars(nextMilestone.threshold)} to ${nextMilestone.title}`
                  : "Max milestone reached!"}
              </span>
            </div>
            <div className="xp-bar large">
              <div
                className="xp-bar-fill"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Daily Challenge */}
      <section className="daily-challenge">
        <Link href={dailyMission.path} className="daily-challenge-card pulse-glow">
          <div className="daily-challenge-header">
            <div className="daily-challenge-badge">TODAY&apos;S MISSION</div>
            <div className="daily-challenge-timer">
              <span className="daily-challenge-timer-dot" />
              Active Now
            </div>
          </div>
          <h2 className="daily-challenge-title">
            <span className="daily-challenge-icon">{dailyMission.icon}</span>
            {dailyMission.title}
          </h2>
          <p className="daily-challenge-desc">
            {dailyMission.desc || "Complete today\u0027s challenge to earn bonus cash and keep your streak going!"}
          </p>
          <div className="daily-challenge-footer">
            <div className="daily-challenge-reward">
              <span className="daily-challenge-reward-icon">{"\uD83C\uDFAF"}</span>
              <span>+$0.50 Reward</span>
            </div>
            <span className="daily-challenge-cta">Start Mission {"\u2192"}</span>
          </div>
        </Link>
      </section>

      {/* Activity Quest Cards */}
      <section className="quest-section">
        <h2 className="section-heading">
          <span className="section-heading-icon">{"\u2694\uFE0F"}</span>
          Choose Your Quest
        </h2>
        <div className="quest-grid">
          {/* Vocab Quest */}
          <Link href="/vocabulary" className="quest-card quest-vocab">
            <div className="quest-card-header">
              <span className="quest-icon">{"\uD83C\uDFD2"}</span>
              <div className="quest-difficulty">
                <span className="quest-star filled">{"\u2605"}</span>
                <span className="quest-star filled">{"\u2605"}</span>
                <span className="quest-star empty">{"\u2605"}</span>
              </div>
            </div>
            <h3 className="quest-title">Vocab Breakaway</h3>
            <p className="quest-desc">
              Master words like a power play — flashcards, quizzes, and hat tricks
            </p>
            <div className="quest-progress">
              <div className="quest-progress-info">
                <span>{wordsmastered}/40 words mastered</span>
                <span className="quest-progress-pct">
                  {Math.round((wordsmastered / 40) * 100)}%
                </span>
              </div>
              <div className="xp-bar">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${(wordsmastered / 40) * 100}%` }}
                />
              </div>
            </div>
            <div className="quest-cta">Hit the Ice {"\u2192"}</div>
          </Link>

          {/* Reading Arena */}
          <Link href="/reading" className="quest-card quest-reading">
            <div className="quest-card-header">
              <span className="quest-icon">{"\u2744\uFE0F"}</span>
              <div className="quest-difficulty">
                <span className="quest-star filled">{"\u2605"}</span>
                <span className="quest-star filled">{"\u2605"}</span>
                <span className="quest-star filled">{"\u2605"}</span>
              </div>
            </div>
            <h3 className="quest-title">Reading Expedition</h3>
            <p className="quest-desc">
              Explore passages and poems — from Arctic adventures to poetry
            </p>
            <div className="quest-progress">
              <div className="quest-progress-info">
                <span>8 passages available</span>
                <span className="quest-progress-pct">3 genres</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: "30%" }} />
              </div>
            </div>
            <div className="quest-cta">Explore {"\u2192"}</div>
          </Link>

          {/* AI Battle */}
          <Link href="/practice" className="quest-card quest-ai">
            <div className="quest-card-header">
              <span className="quest-icon">{"\uD83E\uDD16"}</span>
              <div className="quest-difficulty">
                <span className="quest-star filled">{"\u2605"}</span>
                <span className="quest-star filled">{"\u2605"}</span>
                <span className="quest-star filled">{"\u2605"}</span>
              </div>
            </div>
            <h3 className="quest-title">AI Shootout</h3>
            <p className="quest-desc">
              Go 1-on-1 with the AI Tutor — it adapts like a tough opponent
            </p>
            <div className="quest-progress">
              <div className="quest-progress-info">
                <span>Personalized practice</span>
                <span className="quest-progress-pct">Adaptive</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: "50%" }} />
              </div>
            </div>
            <div className="quest-cta">Face Off {"\u2192"}</div>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="recent-activity">
        <h2 className="section-heading">
          <span className="section-heading-icon">{"\uD83D\uDCCB"}</span>
          Recent Activity
        </h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon-wrapper activity-icon-vocab">
              <span className="activity-icon">{"\uD83D\uDCDA"}</span>
            </div>
            <div className="activity-info">
              <span className="activity-title">Vocabulary Quiz</span>
              <span className="activity-meta">Score pending — start your first session!</span>
            </div>
            <span className="activity-xp">$0.00</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon-wrapper activity-icon-reading">
              <span className="activity-icon">{"\uD83D\uDCD6"}</span>
            </div>
            <div className="activity-info">
              <span className="activity-title">Reading Comprehension</span>
              <span className="activity-meta">No sessions yet — jump in!</span>
            </div>
            <span className="activity-xp">$0.00</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon-wrapper activity-icon-ai">
              <span className="activity-icon">{"\uD83E\uDD16"}</span>
            </div>
            <div className="activity-info">
              <span className="activity-title">AI Practice</span>
              <span className="activity-meta">The AI tutor is waiting for you</span>
            </div>
            <span className="activity-xp">$0.00</span>
          </div>
        </div>
      </section>

      {/* Skills Progress */}
      <section className="skills-section">
        <h2 className="section-heading">
          <span className="section-heading-icon">{"\uD83D\uDCCA"}</span>
          Skills Progress
        </h2>
        <div className="skills-grid">
          {skills.map((skill) => (
            <div key={skill.name} className="skill-tag">
              <div className="skill-tag-header">
                <span className="skill-icon">{skill.icon}</span>
                <span className="skill-name">{skill.name}</span>
                <span className="skill-pct">{skill.progress}%</span>
              </div>
              <div className="xp-bar">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tutor Admin Link */}
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <Link
          href="/admin/upload"
          style={{
            color: "#64748b",
            fontSize: "0.8rem",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {"\u270D\uFE0F"} Tutor Dashboard
        </Link>
      </div>
    </div>
  );
}
