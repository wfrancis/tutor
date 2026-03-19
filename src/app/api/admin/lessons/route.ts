import { NextRequest, NextResponse } from "next/server";
import { loadData, addVocabWords, addLiteraryDevices, addReadingPassages, deleteItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = loadData();

  // Group vocab by lesson
  const lessonNumbers = [...new Set(data.vocabWords.map((w) => w.lesson))].sort(
    (a, b) => a - b
  );

  return NextResponse.json({
    vocabWords: data.vocabWords,
    literaryDevices: data.literaryDevices,
    readingPassages: data.readingPassages,
    lessonNumbers,
    stats: {
      totalVocab: data.vocabWords.length,
      totalDevices: data.literaryDevices.length,
      totalPassages: data.readingPassages.length,
      lessons: lessonNumbers.length,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vocabWords, literaryDevices, readingPassages, lesson } = body;

    if (vocabWords?.length) {
      addVocabWords(
        vocabWords.map((w: Record<string, unknown>) => ({ ...w, lesson: lesson || w.lesson || 1 }))
      );
    }

    if (literaryDevices?.length) {
      addLiteraryDevices(literaryDevices);
    }

    if (readingPassages?.length) {
      addReadingPassages(
        readingPassages.map((p: Record<string, unknown>) => ({ ...p, lesson: lesson || p.lesson || 1 }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { type, id } = await req.json();
    const found = deleteItem(type, id);
    if (!found) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
