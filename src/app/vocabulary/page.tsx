"use client";

import { useState, useMemo } from "react";
import { vocabularyWords, VocabWord } from "@/data/lessons";

type Mode = "flashcards" | "quiz";

export default function VocabularyPage() {
  const [mode, setMode] = useState<Mode>("flashcards");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const filteredWords = useMemo(() => {
    if (selectedLesson === null) return vocabularyWords;
    return vocabularyWords.filter((w) => w.lesson === selectedLesson);
  }, [selectedLesson]);

  const currentWord = filteredWords[currentIndex];

  const quizQuestions = useMemo(() => {
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(10, shuffled.length)).map((word) => {
      const wrongAnswers = vocabularyWords
        .filter((w) => w.term !== word.term)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.definition);
      const options = [...wrongAnswers, word.definition].sort(() => Math.random() - 0.5);
      return { word, options };
    });
  }, [filteredWords]);

  function handleQuizSubmit() {
    let correct = 0;
    quizQuestions.forEach((q, i) => {
      if (quizAnswers[i] === q.word.definition) correct++;
    });
    setScore(correct);
    setQuizSubmitted(true);
  }

  function resetQuiz() {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  }

  const lessons = Array.from(new Set(vocabularyWords.map((w) => w.lesson))).sort();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Vocabulary Builder</h1>
      <p className="text-[var(--muted)] mb-6">
        {filteredWords.length} words from {selectedLesson === null ? "all lessons" : `Lesson ${selectedLesson}`}
      </p>

      {/* Filters & Mode Toggle */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          <button className={`btn ${mode === "flashcards" ? "btn-primary" : "btn-secondary"}`} onClick={() => { setMode("flashcards"); setCurrentIndex(0); setShowAnswer(false); }}>
            Flashcards
          </button>
          <button className={`btn ${mode === "quiz" ? "btn-primary" : "btn-secondary"}`} onClick={() => { setMode("quiz"); resetQuiz(); }}>
            Quiz
          </button>
        </div>
        <div className="flex gap-1 ml-auto flex-wrap">
          <button className={`btn text-xs ${selectedLesson === null ? "btn-primary" : "btn-secondary"}`} onClick={() => { setSelectedLesson(null); setCurrentIndex(0); }}>
            All
          </button>
          {lessons.map((l) => (
            <button key={l} className={`btn text-xs ${selectedLesson === l ? "btn-primary" : "btn-secondary"}`} onClick={() => { setSelectedLesson(l); setCurrentIndex(0); }}>
              L{l}
            </button>
          ))}
        </div>
      </div>

      {mode === "flashcards" && currentWord && (
        <div className="animate-in">
          <div className="progress-bar mb-4">
            <div className="progress-fill" style={{ width: `${((currentIndex + 1) / filteredWords.length) * 100}%` }} />
          </div>
          <p className="text-sm text-[var(--muted)] mb-4">{currentIndex + 1} of {filteredWords.length}</p>

          <div className="card min-h-[250px] flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => setShowAnswer(!showAnswer)}>
            {!showAnswer ? (
              <>
                <p className="text-sm text-[var(--muted)] mb-2">TERM</p>
                <h2 className="text-3xl font-bold mb-4">{currentWord.term}</h2>
                <p className="text-sm text-[var(--muted)]">Tap to reveal definition</p>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--muted)] mb-2">DEFINITION</p>
                <h2 className="text-xl font-semibold mb-4">{currentWord.definition}</h2>
                {currentWord.example && (
                  <p className="text-sm text-[var(--muted)] italic max-w-lg">"{currentWord.example}"</p>
                )}
              </>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button className="btn btn-secondary" disabled={currentIndex === 0} onClick={() => { setCurrentIndex(currentIndex - 1); setShowAnswer(false); }}>
              ← Previous
            </button>
            <button className="btn btn-primary" disabled={currentIndex === filteredWords.length - 1} onClick={() => { setCurrentIndex(currentIndex + 1); setShowAnswer(false); }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {mode === "quiz" && (
        <div className="animate-in">
          {!quizSubmitted ? (
            <>
              {quizQuestions.map((q, qi) => (
                <div key={qi} className="card mb-4">
                  <p className="font-semibold mb-3">
                    {qi + 1}. What is the definition of <span className="text-[var(--primary)]">"{q.word.term}"</span>?
                  </p>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${quizAnswers[qi] === opt ? "border-[var(--primary)] bg-blue-50" : "border-[var(--card-border)] hover:bg-gray-50"}`}>
                        <input type="radio" name={`q-${qi}`} checked={quizAnswers[qi] === opt} onChange={() => setQuizAnswers({ ...quizAnswers, [qi]: opt })} className="mt-0.5" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn btn-success w-full text-lg py-3" onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < quizQuestions.length}>
                Submit Quiz
              </button>
            </>
          ) : (
            <div className="card text-center">
              <h2 className="text-4xl font-bold mb-2">{score}/{quizQuestions.length}</h2>
              <p className="text-[var(--muted)] mb-4">
                {score === quizQuestions.length ? "Perfect score! Amazing work!" : score >= quizQuestions.length * 0.7 ? "Great job! Keep practicing!" : "Keep studying — you'll get there!"}
              </p>
              <div className="space-y-3 text-left mb-6">
                {quizQuestions.map((q, qi) => {
                  const correct = quizAnswers[qi] === q.word.definition;
                  return (
                    <div key={qi} className={`p-3 rounded-lg border ${correct ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
                      <p className="font-semibold text-sm">{q.word.term}: {correct ? "✓ Correct" : "✗ Incorrect"}</p>
                      {!correct && <p className="text-sm text-[var(--muted)] mt-1">Correct answer: {q.word.definition}</p>}
                    </div>
                  );
                })}
              </div>
              <button className="btn btn-primary" onClick={resetQuiz}>Try Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
