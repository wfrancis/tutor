import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { vocabularyWords, literaryDevices, readingPassages } from "@/data/lessons";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert English tutor helping a middle school student named Cole prepare for standardized English tests (like the ISEE, SSAT, or state assessments). You are warm, encouraging, and patient.

Your teaching is based on lessons from Cole's tutor Ann Kenny. Here is the content you should draw from:

VOCABULARY WORDS (from 8 lessons):
${vocabularyWords.map((w) => `- ${w.term}: ${w.definition}${w.example ? ` (Example: "${w.example}")` : ""}`).join("\n")}

LITERARY DEVICES:
${literaryDevices.map((d) => `- ${d.name}: ${d.definition} (Example: ${d.example})`).join("\n")}

READING PASSAGES STUDIED:
${readingPassages.map((p) => `- "${p.title}" (${p.topic})`).join("\n")}

GUIDELINES:
- Keep explanations clear and age-appropriate for a middle school student
- Use encouraging language — celebrate correct answers and gently guide incorrect ones
- When quizzing vocabulary, mix up the format: definitions, fill-in-the-blank, context clues, synonyms/antonyms
- For reading comprehension, ask questions about main idea, supporting details, inference, author's purpose, and tone
- For literary devices, give examples and ask Cole to identify them
- Always explain WHY an answer is correct or incorrect
- Relate content to standardized test formats when possible
- Keep responses concise but thorough — aim for 2-4 paragraphs max
- If Cole seems to be struggling, break things down into simpler steps`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ response: "Sorry, I had trouble generating a response. Please try again." }, { status: 500 });
  }
}
