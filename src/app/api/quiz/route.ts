import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { vocabularyWords, literaryDevices } from "@/data/lessons";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, passage, passageContent, answers } = body;

    let prompt = "";

    if (type === "reading") {
      prompt = `You are an expert English tutor helping a middle school student named Cole prepare for standardized tests.

The student just read the passage "${passage}" and answered practice questions. Here are their answers:

PASSAGE:
${passageContent}

STUDENT'S ANSWERS:
1. Main idea/theme: ${answers?.q1 || "(not answered)"}
2. Literary devices identified: ${answers?.q2 || "(not answered)"}
3. Author's purpose/deeper meaning: ${answers?.q3 || "(not answered)"}

AVAILABLE LITERARY DEVICES FOR REFERENCE:
${literaryDevices.map((d) => `- ${d.name}: ${d.definition}`).join("\n")}

Please provide detailed, encouraging feedback on each answer:
- Tell Cole what they got right (be specific!)
- Gently correct any mistakes or misunderstandings
- Point out things they may have missed
- Suggest how they could strengthen their answers for a standardized test
- Use a warm, encouraging tone appropriate for a middle school student`;
    } else if (type === "generate_questions") {
      prompt = `You are an expert English tutor creating standardized test-style practice questions for a middle school student.

Based on this passage, generate 5 multiple-choice questions in standardized test format:

PASSAGE: "${passage}"
${passageContent}

VOCABULARY WORDS THE STUDENT IS LEARNING:
${vocabularyWords.map((w) => `${w.term}: ${w.definition}`).join("\n")}

Create questions covering:
1. Main idea / central theme
2. Vocabulary in context (use words from the vocabulary list if they appear or relate)
3. Making inferences
4. Author's purpose or tone
5. Text structure or literary device identification

Format each question with:
- The question
- Four answer choices (A, B, C, D)
- The correct answer with a brief explanation

Make sure questions are appropriate for middle school level and aligned with standardized test formats.`;
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json({ response: "Sorry, I had trouble generating a response. Please try again." }, { status: 500 });
  }
}
