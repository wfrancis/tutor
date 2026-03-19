import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Hey Cole! Ready to Practice?</h1>
        <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
          AI-powered English practice built from your lessons with Ann Kenny.
          Master vocabulary, reading comprehension, and literary devices for your standardized tests.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Link href="/vocabulary" className="card group cursor-pointer">
          <div className="text-3xl mb-3">📖</div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
            Vocabulary Builder
          </h2>
          <p className="text-[var(--muted)] text-sm">
            Study and quiz yourself on 40 vocabulary words from your lessons. Flashcards, matching, and fill-in-the-blank.
          </p>
          <div className="mt-4 text-[var(--primary)] text-sm font-semibold">
            8 lessons → 40 words →
          </div>
        </Link>

        <Link href="/reading" className="card group cursor-pointer">
          <div className="text-3xl mb-3">📝</div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
            Reading & Analysis
          </h2>
          <p className="text-[var(--muted)] text-sm">
            Practice reading comprehension with passages and poems from your lessons. AI generates questions and gives feedback.
          </p>
          <div className="mt-4 text-[var(--primary)] text-sm font-semibold">
            Poetry + History + Culture →
          </div>
        </Link>

        <Link href="/practice" className="card group cursor-pointer">
          <div className="text-3xl mb-3">🤖</div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
            AI Practice Session
          </h2>
          <p className="text-[var(--muted)] text-sm">
            Chat with an AI tutor that creates custom practice questions, explains answers, and adapts to what you need to work on.
          </p>
          <div className="mt-4 text-[var(--primary)] text-sm font-semibold">
            Personalized practice →
          </div>
        </Link>
      </div>

      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <h3 className="text-lg font-bold mb-2">About This Site</h3>
        <p className="text-[var(--muted)] text-sm leading-relaxed">
          This practice hub is built from your tutoring sessions with Ann Kenny (Jan–Mar 2026).
          It covers vocabulary, literary devices (metaphor, simile, cliché, imagery),
          poetry analysis (Robert Hayden, Langston Hughes), historical reading (Roman Empire, BCE/CE),
          and cultural texts (The Blues). All content is aligned to standardized English test formats.
        </p>
      </div>
    </div>
  );
}
