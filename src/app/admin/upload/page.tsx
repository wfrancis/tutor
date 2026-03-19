"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface VocabPreview {
  term: string;
  definition: string;
  example?: string;
  difficulty?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface PassagePreview {
  title: string;
  topic: string;
  content: string;
}

interface DevicePreview {
  name: string;
  definition: string;
  example: string;
}

interface ExistingData {
  vocabWords: (VocabPreview & { id: number; lesson: number })[];
  literaryDevices: (DevicePreview & { id: number })[];
  readingPassages: (PassagePreview & { id: number; lesson: number })[];
  stats: {
    totalVocab: number;
    totalDevices: number;
    totalPassages: number;
    lessons: number;
  };
  lessonNumbers: number[];
}

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [lesson, setLesson] = useState(9);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [vocabPreview, setVocabPreview] = useState<VocabPreview[]>([]);
  const [passagePreview, setPassagePreview] = useState<PassagePreview[]>([]);
  const [devicePreview, setDevicePreview] = useState<DevicePreview[]>([]);
  const [rawText, setRawText] = useState("");

  // Existing data
  const [existing, setExisting] = useState<ExistingData | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "manage">("upload");

  const fetchExisting = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/lessons");
      if (res.ok) setExisting(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchExisting();
  }, [fetchExisting]);

  function handleFile(f: File) {
    setFile(f);
    setError("");
    setSuccess("");
    setVocabPreview([]);
    setPassagePreview([]);
    setDevicePreview([]);
    setRawText("");
  }

  async function handleParse() {
    if (!file) return;
    setParsing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to parse file");
        return;
      }

      setVocabPreview(data.extracted.vocabWords || []);
      setPassagePreview(data.extracted.readingPassages || []);
      setDevicePreview(data.extracted.literaryDevices || []);
      setRawText(data.rawText || "");
    } catch {
      setError("Failed to upload file. Please try again.");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vocabWords: vocabPreview,
          literaryDevices: devicePreview,
          readingPassages: passagePreview,
          lesson,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setSuccess(
        `Saved ${vocabPreview.length} vocab words, ${passagePreview.length} passages, and ${devicePreview.length} literary devices to Lesson ${lesson}!`
      );
      setFile(null);
      setVocabPreview([]);
      setPassagePreview([]);
      setDevicePreview([]);
      setRawText("");
      fetchExisting();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(type: "vocab" | "device" | "passage", id: number) {
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      if (res.ok) fetchExisting();
    } catch {}
  }

  const hasPreview =
    vocabPreview.length > 0 ||
    passagePreview.length > 0 ||
    devicePreview.length > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b1120, #1e3a5f)",
        color: "#f1f5f9",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #2a3a4e",
          background: "rgba(11, 17, 32, 0.9)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{"\u270D\uFE0F"}</span>
            <h1
              style={{
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
                fontWeight: 900,
                margin: 0,
                background: "linear-gradient(135deg, #00d4aa, #33e0be)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Tutor Dashboard
            </h1>
          </div>
          <a
            href="/"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {"\u2190"} Back to App
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 80px" }}>
        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 24,
            background: "#1a2332",
            borderRadius: 12,
            padding: 4,
            border: "1px solid #2a3a4e",
          }}
        >
          {(["upload", "manage"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.2s",
                background: activeTab === tab ? "#00d4aa" : "transparent",
                color: activeTab === tab ? "#0b1120" : "#94a3b8",
              }}
            >
              {tab === "upload" ? "\uD83D\uDCE4 Upload Lesson" : `\uD83D\uDCDA Manage Content (${existing?.stats.totalVocab || 0})`}
            </button>
          ))}
        </div>

        {activeTab === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Upload zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `3px dashed ${dragOver ? "#00d4aa" : file ? "#22c55e" : "#2a3a4e"}`,
                borderRadius: 16,
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                background: dragOver
                  ? "rgba(0, 212, 170, 0.08)"
                  : file
                    ? "rgba(34, 197, 94, 0.08)"
                    : "#1a2332",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {file ? "\u2705" : "\uD83D\uDCC4"}
              </div>
              <p
                style={{
                  fontSize: "clamp(16px, 4vw, 20px)",
                  fontWeight: 800,
                  margin: "0 0 8px",
                  color: file ? "#22c55e" : "#f1f5f9",
                }}
              >
                {file ? file.name : "Upload Lesson File"}
              </p>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB — Click to change`
                  : "Drag & drop or click to browse. Supports PDF, Word (.docx), and text files."}
              </p>
            </div>

            {/* Lesson number + Parse button */}
            {file && !hasPreview && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#cbd5e1",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Lesson #:
                  </label>
                  <select
                    value={lesson}
                    onChange={(e) => setLesson(Number(e.target.value))}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "2px solid #2a3a4e",
                      background: "#1a2332",
                      color: "#f1f5f9",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        Lesson {n}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleParse}
                  disabled={parsing}
                  style={{
                    padding: "16px 32px",
                    borderRadius: 12,
                    border: "none",
                    background: parsing
                      ? "#374151"
                      : "linear-gradient(135deg, #00d4aa, #00b893)",
                    color: parsing ? "#94a3b8" : "#0b1120",
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: parsing ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    width: "100%",
                  }}
                >
                  {parsing
                    ? "\uD83E\uDD16 AI is analyzing your file..."
                    : "\u26A1 Analyze with AI"}
                </button>
              </div>
            )}

            {/* Error / Success messages */}
            {error && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  color: "#fca5a5",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1px solid #22c55e",
                  color: "#86efac",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {success}
              </div>
            )}

            {/* Raw text preview */}
            {rawText && (
              <details
                style={{
                  background: "#1a2332",
                  border: "1px solid #2a3a4e",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#94a3b8",
                  }}
                >
                  Raw extracted text (preview)
                </summary>
                <pre
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: "#cbd5e1",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {rawText}
                </pre>
              </details>
            )}

            {/* Preview cards */}
            {hasPreview && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {"\uD83D\uDD0E"} AI Extraction Preview
                </h2>
                <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>
                  Review what the AI found. These items will be added to Lesson{" "}
                  {lesson}.
                </p>

                {/* Vocab preview */}
                {vocabPreview.length > 0 && (
                  <PreviewSection
                    title={`Vocabulary Words (${vocabPreview.length})`}
                    icon={"\uD83D\uDCDA"}
                    color="#00d4aa"
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 12,
                      }}
                    >
                      {vocabPreview.map((w, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#111827",
                            borderRadius: 10,
                            padding: 14,
                            border: "1px solid #2a3a4e",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <strong style={{ color: "#00d4aa", fontSize: 15 }}>
                              {w.term}
                            </strong>
                            {w.difficulty && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  background:
                                    w.difficulty === "easy"
                                      ? "rgba(34, 197, 94, 0.2)"
                                      : w.difficulty === "hard"
                                        ? "rgba(239, 68, 68, 0.2)"
                                        : "rgba(245, 158, 11, 0.2)",
                                  color:
                                    w.difficulty === "easy"
                                      ? "#86efac"
                                      : w.difficulty === "hard"
                                        ? "#fca5a5"
                                        : "#fde68a",
                                }}
                              >
                                {w.difficulty}
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontSize: 13,
                              color: "#cbd5e1",
                            }}
                          >
                            {w.definition}
                          </p>
                          {w.example && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "#64748b",
                                fontStyle: "italic",
                              }}
                            >
                              {'"'}{w.example}{'"'}
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setVocabPreview(vocabPreview.filter((_, j) => j !== i));
                            }}
                            style={{
                              marginTop: 8,
                              fontSize: 11,
                              color: "#ef4444",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              fontWeight: 600,
                            }}
                          >
                            {"\u2715"} Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </PreviewSection>
                )}

                {/* Passages preview */}
                {passagePreview.length > 0 && (
                  <PreviewSection
                    title={`Reading Passages (${passagePreview.length})`}
                    icon={"\uD83D\uDCD6"}
                    color="#7c3aed"
                  >
                    {passagePreview.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#111827",
                          borderRadius: 10,
                          padding: 14,
                          border: "1px solid #2a3a4e",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <strong style={{ color: "#7c3aed" }}>
                            {p.title}
                          </strong>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: "rgba(124, 58, 237, 0.2)",
                              color: "#c4b5fd",
                            }}
                          >
                            {p.topic}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: "#cbd5e1",
                            whiteSpace: "pre-wrap",
                            maxHeight: 150,
                            overflow: "auto",
                          }}
                        >
                          {p.content}
                        </p>
                        <button
                          onClick={() => {
                            setPassagePreview(passagePreview.filter((_, j) => j !== i));
                          }}
                          style={{
                            marginTop: 8,
                            fontSize: 11,
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            fontWeight: 600,
                          }}
                        >
                          {"\u2715"} Remove
                        </button>
                      </div>
                    ))}
                  </PreviewSection>
                )}

                {/* Devices preview */}
                {devicePreview.length > 0 && (
                  <PreviewSection
                    title={`Literary Devices (${devicePreview.length})`}
                    icon={"\uD83C\uDFAD"}
                    color="#ff6b35"
                  >
                    {devicePreview.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#111827",
                          borderRadius: 10,
                          padding: 14,
                          border: "1px solid #2a3a4e",
                          marginBottom: 8,
                        }}
                      >
                        <strong style={{ color: "#ff6b35" }}>{d.name}</strong>
                        <p
                          style={{
                            margin: "4px 0",
                            fontSize: 13,
                            color: "#cbd5e1",
                          }}
                        >
                          {d.definition}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: "#64748b",
                            fontStyle: "italic",
                          }}
                        >
                          {d.example}
                        </p>
                        <button
                          onClick={() => {
                            setDevicePreview(devicePreview.filter((_, j) => j !== i));
                          }}
                          style={{
                            marginTop: 8,
                            fontSize: 11,
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            fontWeight: 600,
                          }}
                        >
                          {"\u2715"} Remove
                        </button>
                      </div>
                    ))}
                  </PreviewSection>
                )}

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "18px 32px",
                    borderRadius: 12,
                    border: "none",
                    background: saving
                      ? "#374151"
                      : "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: saving ? "#94a3b8" : "white",
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: saving
                      ? "none"
                      : "0 4px 14px rgba(34, 197, 94, 0.35)",
                    width: "100%",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : `\u2705 Save to Lesson ${lesson}`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manage tab */}
        {activeTab === "manage" && existing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 12,
              }}
            >
              {[
                {
                  label: "Vocab Words",
                  value: existing.stats.totalVocab,
                  color: "#00d4aa",
                },
                {
                  label: "Passages",
                  value: existing.stats.totalPassages,
                  color: "#7c3aed",
                },
                {
                  label: "Devices",
                  value: existing.stats.totalDevices,
                  color: "#ff6b35",
                },
                {
                  label: "Lessons",
                  value: existing.stats.lessons,
                  color: "#f59e0b",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#1a2332",
                    borderRadius: 12,
                    padding: 16,
                    border: "1px solid #2a3a4e",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Vocab list by lesson */}
            <ContentSection
              title="Vocabulary Words"
              items={existing.vocabWords}
              renderItem={(w) => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#111827",
                    borderRadius: 8,
                    border: "1px solid #2a3a4e",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        color: "#00d4aa",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {w.term}
                    </span>
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: 12,
                        marginLeft: 8,
                      }}
                    >
                      L{w.lesson}
                    </span>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 12,
                        color: "#94a3b8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {w.definition}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete("vocab", w.id)}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {"\u2715"}
                  </button>
                </div>
              )}
            />

            {/* Passages list */}
            <ContentSection
              title="Reading Passages"
              items={existing.readingPassages}
              renderItem={(p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#111827",
                    borderRadius: 8,
                    border: "1px solid #2a3a4e",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        color: "#7c3aed",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {p.title}
                    </span>
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: 12,
                        marginLeft: 8,
                      }}
                    >
                      {p.topic} &middot; L{p.lesson}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete("passage", p.id)}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {"\u2715"}
                  </button>
                </div>
              )}
            />

            {/* Devices list */}
            <ContentSection
              title="Literary Devices"
              items={existing.literaryDevices}
              renderItem={(d) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#111827",
                    borderRadius: 8,
                    border: "1px solid #2a3a4e",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        color: "#ff6b35",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {d.name}
                    </span>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 12,
                        color: "#94a3b8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.definition}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete("device", d.id)}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {"\u2715"}
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function PreviewSection({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#1a2332",
        borderRadius: 12,
        padding: 16,
        border: `1px solid ${color}30`,
      }}
    >
      <h3
        style={{
          margin: "0 0 12px",
          fontSize: 16,
          fontWeight: 800,
          color,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function ContentSection<T extends { id: number }>({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayed = expanded ? items : items.slice(0, 5);

  return (
    <div
      style={{
        background: "#1a2332",
        borderRadius: 12,
        padding: 16,
        border: "1px solid #2a3a4e",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px",
          fontSize: 16,
          fontWeight: 800,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {title}
        <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>
          {items.length} total
        </span>
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {displayed.map(renderItem)}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: 10,
            background: "none",
            border: "none",
            color: "#00d4aa",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {expanded
            ? "Show less"
            : `Show all ${items.length} items`}
        </button>
      )}
    </div>
  );
}
