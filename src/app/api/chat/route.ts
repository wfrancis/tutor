import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/db";

const client = new Anthropic();

function buildSystemPrompt(): string {
  const data = loadData();

  return `You are an expert English tutor helping a middle school student named Cole prepare for standardized English tests (like the ISEE, SSAT, or state assessments). You are warm, encouraging, and patient.

Your teaching is based on lessons from Cole's tutor Ann Kenny. Here is the content you should draw from:

VOCABULARY WORDS (from ${[...new Set(data.vocabWords.map((w) => w.lesson))].length} lessons):
${data.vocabWords.map((w) => `- ${w.term}: ${w.definition}${w.example ? ` (Example: "${w.example}")` : ""}`).join("\n")}

LITERARY DEVICES:
${data.literaryDevices.map((d) => `- ${d.name}: ${d.definition} (Example: ${d.example})`).join("\n")}

READING PASSAGES STUDIED:
${data.readingPassages.map((p) => `- "${p.title}" (${p.topic})`).join("\n")}

GUIDELINES:
- BE CONCISE. No fluff. No preambles. No explaining what you're about to do.
- Ask only ONE question at a time. Wait for Cole to answer before asking the next.
- Format ALL questions like standardized tests (ISEE, SSAT, ACT, SAT style):
  * Always multiple choice with 4 options (A), (B), (C), (D)
  * Write the question stem clearly, then list the 4 choices
  * For vocabulary: "The word ___ most nearly means..." or "In the context of the sentence, ___ means..."
  * For reading: "According to the passage...", "The author's primary purpose is...", "It can be inferred that..."
- When starting a session: just say "Let's go!" or similar (MAX 5 words), then immediately the first question.
- Keep feedback to 1 sentence. "Correct!" or "Not quite — the answer is (B) because [brief reason]." Then next question.
- Do NOT use markdown headers (#). Just plain text with **bold** for key words.
- Do NOT list what you're going to cover. Do NOT explain your approach. Just ask questions.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: buildSystemPrompt(),
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Chat API error:", errMsg);
    return NextResponse.json({ response: `Sorry, I had trouble generating a response. Error: ${errMsg}` }, { status: 500 });
  }
}
