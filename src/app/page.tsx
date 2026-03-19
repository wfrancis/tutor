"use client";

import Link from "next/link";
import { useGameState } from "@/components/GameElements";

const skills = [
  { name: "Metaphor & Simile", progress: 70, icon: "🎭" },
  { name: "Vocabulary", progress: 45, icon: "📝" },
  { name: "Reading Comp", progress: 55, icon: "📖" },
  { name: "Poetry Analysis", progress: 40, icon: "🎵" },
  { name: "Literary Devices", progress: 60, icon: "🔬" },
  { name: "Context Clues", progress: 35, icon: "🔎" },
];

const missions = [
  { title: "Vocab Speed Round", path: "/vocabulary", type: "vocab", icon: "📚" },
  { title: "Poetry Deep Dive", path: "/reading", type: "reading", icon: "📖" },
  { title: "AI Grammar Battle", path: "/practice", type: "practice", icon: "🤖" },
  { title: "Context Clue Challenge", path: "/vocabulary", type: "vocab", icon: "🔎" },
  { title: "Reading Blitz", path: "/reading", type: "reading", icon: "📖" },
];

function getDailyMission() {
  const today = new Date();
  const dayIndex =
    (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) %
    missions.length;
  return missions[dayIndex];
}

export default function Home() {
  const { xp, streak, level, wordsmastered } = useGameState();
  const dailyMission = getDailyMission();
  const xpInLevel = xp % 200;
  const xpNeeded = 200;
  const levelProgress = (xpInLevel / xpNeeded) * 100;

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-greeting">
            <h1 className="hero-title">
              Hey Cole! <span className="hero-wave">👋</span>
            </h1>
            <p className="hero-subtitle">Ready for today&apos;s quest?</p>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-card hero-stat-level">
              <div className="hero-stat-icon">🛡️</div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{level}</span>
                <span className="hero-stat-label">Level</span>
              </div>
            </div>
            <div className="hero-stat-card hero-stat-xp">
              <div className="hero-stat-icon">⚡</div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{xp.toLocaleString()}</span>
                <span className="hero-stat-label">Total XP</span>
              </div>
            </div>
            <div className="hero-stat-card hero-stat-streak">
              <div className="hero-stat-icon">🔥</div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{streak}</span>
                <span className="hero-stat-label">Day Streak</span>
              </div>
            </div>
          </div>

          <div className="hero-level-bar">
            <div className="hero-level-info">
              <span className="hero-level-current">Level {level}</span>
              <span className="hero-level-progress">
                {xpInLevel}/{xpNeeded} XP to Level {level + 1}
              </span>
            </div>
            <div className="xp-bar large">
              <div
                className="xp-bar-fill"
                style={{ width: `${levelProgress}%` }}
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
            Complete today&apos;s challenge to earn bonus XP and keep your streak going!
          </p>
          <div className="daily-challenge-footer">
            <div className="daily-challenge-reward">
              <span className="daily-challenge-reward-icon">🎯</span>
              <span>+50 XP Reward</span>
            </div>
            <span className="daily-challenge-cta">Start Mission →</span>
          </div>
        </Link>
      </section>

      {/* Activity Quest Cards */}
      <section className="quest-section">
        <h2 className="section-heading">
          <span className="section-heading-icon">⚔️</span>
          Choose Your Quest
        </h2>
        <div className="quest-grid">
          {/* Vocab Quest */}
          <Link href="/vocabulary" className="quest-card quest-vocab">
            <div className="quest-card-header">
              <span className="quest-icon">📚</span>
              <div className="quest-difficulty">
                <span className="quest-star filled">★</span>
                <span className="quest-star filled">★</span>
                <span className="quest-star empty">★</span>
              </div>
            </div>
            <h3 className="quest-title">Vocab Quest</h3>
            <p className="quest-desc">
              Master vocabulary from your lessons with flashcards and quizzes
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
            <div className="quest-cta">Enter Quest →</div>
          </Link>

          {/* Reading Arena */}
          <Link href="/reading" className="quest-card quest-reading">
            <div className="quest-card-header">
              <span className="quest-icon">📖</span>
              <div className="quest-difficulty">
                <span className="quest-star filled">★</span>
                <span className="quest-star filled">★</span>
                <span className="quest-star filled">★</span>
              </div>
            </div>
            <h3 className="quest-title">Reading Arena</h3>
            <p className="quest-desc">
              Tackle passages and poems — poetry, history, and culture
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
            <div className="quest-cta">Enter Arena →</div>
          </Link>

          {/* AI Battle */}
          <Link href="/practice" className="quest-card quest-ai">
            <div className="quest-card-header">
              <span className="quest-icon">🤖</span>
              <div className="quest-difficulty">
                <span className="quest-star filled">★</span>
                <span className="quest-star filled">★</span>
                <span className="quest-star filled">★</span>
              </div>
            </div>
            <h3 className="quest-title">AI Battle</h3>
            <p className="quest-desc">
              Challenge the AI Tutor — it adapts to your skill level
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
            <div className="quest-cta">Start Battle →</div>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="recent-activity">
        <h2 className="section-heading">
          <span className="section-heading-icon">📋</span>
          Recent Activity
        </h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon-wrapper activity-icon-vocab">
              <span className="activity-icon">📚</span>
            </div>
            <div className="activity-info">
              <span className="activity-title">Vocabulary Quiz</span>
              <span className="activity-meta">Score pending — start your first session!</span>
            </div>
            <span className="activity-xp">+0 XP</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon-wrapper activity-icon-reading">
              <span className="activity-icon">📖</span>
            </div>
            <div className="activity-info">
              <span className="activity-title">Reading Comprehension</span>
              <span className="activity-meta">No sessions yet — jump in!</span>
            </div>
            <span className="activity-xp">+0 XP</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon-wrapper activity-icon-ai">
              <span className="activity-icon">🤖</span>
            </div>
            <div className="activity-info">
              <span className="activity-title">AI Practice</span>
              <span className="activity-meta">The AI tutor is waiting for you</span>
            </div>
            <span className="activity-xp">+0 XP</span>
          </div>
        </div>
      </section>

      {/* Skills Progress */}
      <section className="skills-section">
        <h2 className="section-heading">
          <span className="section-heading-icon">📊</span>
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
    </div>
  );
}
