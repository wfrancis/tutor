"use client";

import { useState } from "react";
import { readingPassages, literaryDevices } from "@/data/lessons";

export default function ReadingPage() {
  const [selectedPassage, setSelectedPassage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDevices, setShowDevices] = useState(false);

  const passage = readingPassages[selectedPassage];

  async function getAIFeedback() {
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
    } catch {
      setAiResponse("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function generateQuestions() {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Reading & Analysis</h1>
      <p className="text-[var(--muted)] mb-6">Read passages from your lessons and practice comprehension skills.</p>

      {/* Passage selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {readingPassages.map((p, i) => (
          <button key={i} className={`btn text-sm ${selectedPassage === i ? "btn-primary" : "btn-secondary"}`} onClick={() => { setSelectedPassage(i); setAnswers({}); setAiResponse(""); }}>
            {p.title}
          </button>
        ))}
        <button className={`btn text-sm ${showDevices ? "btn-primary" : "btn-secondary"}`} onClick={() => setShowDevices(!showDevices)}>
          Literary Devices Reference
        </button>
      </div>

      {showDevices && (
        <div className="card mb-6 animate-in">
          <h3 className="font-bold text-lg mb-3">Literary Devices Reference</h3>
          <div className="grid gap-3">
            {literaryDevices.map((d) => (
              <div key={d.name} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-[var(--primary)]">{d.name}</p>
                <p className="text-sm">{d.definition}</p>
                <p className="text-sm text-[var(--muted)] italic mt-1">Example: {d.example}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passage display */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)] bg-blue-50 px-2 py-1 rounded">{passage.topic}</span>
          <span className="text-xs text-[var(--muted)]">Lesson {passage.lesson}</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">{passage.title}</h2>
        <div className="whitespace-pre-line text-sm leading-relaxed bg-gray-50 p-4 rounded-lg font-serif">
          {passage.content}
        </div>
      </div>

      {/* Practice area */}
      <div className="card mb-6">
        <h3 className="font-bold text-lg mb-3">Practice Questions</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">1. What is the main idea or theme of this text?</label>
            <textarea className="w-full p-3 border rounded-lg text-sm min-h-[80px]" placeholder="Type your answer..." value={answers["q1"] || ""} onChange={(e) => setAnswers({ ...answers, q1: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">2. What literary devices or techniques can you identify? Give specific examples from the text.</label>
            <textarea className="w-full p-3 border rounded-lg text-sm min-h-[80px]" placeholder="Type your answer..." value={answers["q2"] || ""} onChange={(e) => setAnswers({ ...answers, q2: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">3. What can you infer about the author's purpose or the deeper meaning?</label>
            <textarea className="w-full p-3 border rounded-lg text-sm min-h-[80px]" placeholder="Type your answer..." value={answers["q3"] || ""} onChange={(e) => setAnswers({ ...answers, q3: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-primary" onClick={getAIFeedback} disabled={loading || !answers.q1}>
            {loading ? "Thinking..." : "Get AI Feedback"}
          </button>
          <button className="btn btn-secondary" onClick={generateQuestions} disabled={loading}>
            {loading ? "Thinking..." : "Generate More Questions"}
          </button>
        </div>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="card animate-in border-l-4 border-l-[var(--primary)]">
          <h3 className="font-bold text-lg mb-3">AI Tutor Feedback</h3>
          <div className="text-sm leading-relaxed whitespace-pre-line">{aiResponse}</div>
        </div>
      )}
    </div>
  );
}
