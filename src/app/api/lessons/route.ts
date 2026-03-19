import { NextResponse } from "next/server";
import { loadData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = loadData();
  return NextResponse.json({
    vocabWords: data.vocabWords,
    literaryDevices: data.literaryDevices,
    readingPassages: data.readingPassages,
  });
}
