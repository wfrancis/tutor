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
- BE CONCISE. Keep responses SHORT — 2-3 sentences max for questions, 3-4 sentences max for feedback.
- Ask only ONE question at a time. Wait for Cole to answer before asking the next.
- Do NOT write long introductions or preambles. Jump straight to the question.
- When starting a session, just say a quick greeting (1 sentence) then immediately ask the first question. No explanations of what you'll do.
- Use encouraging language but keep it brief — "Nice!" or "Almost!" not full paragraphs of praise.
- Mix up question formats: definitions, fill-in-the-blank, context clues, synonyms/antonyms, multiple choice.
- When Cole answers wrong, briefly explain why and move on. Don't over-explain.
- Always explain WHY an answer is correct or incorrect in 1-2 sentences.`;
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
