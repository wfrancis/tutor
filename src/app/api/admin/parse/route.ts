import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const EXTRACTION_PROMPT = `You are a data extraction assistant for an English tutoring app. Given lesson materials from a tutor, extract structured data in JSON format.

Extract any of the following that you find in the document:

1. **Vocabulary words** — terms with definitions, example sentences, difficulty level, synonyms, and antonyms
2. **Reading passages** — poems, articles, stories, or excerpts with a title and topic label
3. **Literary devices** — named devices with definitions and examples

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "vocabWords": [
    {
      "term": "word",
      "definition": "meaning",
      "example": "example sentence using the word",
      "difficulty": "easy" | "medium" | "hard",
      "synonyms": ["syn1", "syn2"],
      "antonyms": ["ant1", "ant2"]
    }
  ],
  "readingPassages": [
    {
      "title": "Title of the passage",
      "topic": "Poetry" | "Historical" | "Cultural" | "Science" | "Literature",
      "content": "The full text of the passage"
    }
  ],
  "literaryDevices": [
    {
      "name": "Device Name",
      "definition": "What it means",
      "example": "An example of it in use"
    }
  ]
}

Rules:
- Only include items you can confidently extract from the document
- For reading passages, include the FULL text exactly as written
- If the document doesn't contain a category, return an empty array for it
- For vocabulary, infer difficulty: common words = easy, academic = medium, rare/specialized = hard
- Return ONLY the JSON object, nothing else`;

async function extractTextFromFile(
  file: File
): Promise<string> {
  const filename = file.name.toLowerCase();

  if (filename.endsWith(".txt")) {
    return await file.text();
  }

  if (filename.endsWith(".pdf")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
    const mammoth = await import("mammoth");
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(
    "Unsupported file type. Please upload a PDF, Word document (.docx), or text file (.txt)."
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract text from the file
    const text = await extractTextFromFile(file);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract any text from the file" },
        { status: 400 }
      );
    }

    // Send to Claude for structured extraction
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Here are the lesson materials to extract from:\n\n---\n${text}\n---\n\nExtract the structured data as described.`,
        },
      ],
      system: EXTRACTION_PROMPT,
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response
    const parsed = JSON.parse(responseText);

    return NextResponse.json({
      extracted: parsed,
      rawText: text.slice(0, 500) + (text.length > 500 ? "..." : ""),
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Parse API error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
