
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 180;

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
const MODEL = "gemma3:4b";

type AgentResult = {
  id: string;
  name: string;
  role: string;
  response: string;
};

async function askModel(system: string, user: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 150_000);

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        options: { temperature: 0.4, num_ctx: 4096 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Ollama returned an empty response.");
    }

    return content.trim();
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json(
        { error: "Enter a question first." },
        { status: 400 }
      );
    }

    if (question.length > 4000) {
      return NextResponse.json(
        { error: "Keep your question under 4,000 characters." },
        { status: 400 }
      );
    }

    // Three independent initial analyses.
    const [edith, dume, u] = await Promise.all([
      askModel(
        "You are EDITH, STARK's research-oriented analyst. Give a careful factual answer from your existing knowledge. Do not claim to browse the web or verify live sources. State uncertainty.",
        question
      ),
      askModel(
        "You are DUM-E, STARK's technical and practical analyst. Explain clearly and use logical steps where useful. Never claim to have run tests you did not run.",
        question
      ),
      askModel(
        "You are U, STARK's independent critic. Identify weak assumptions, counterarguments, missing context, and possible errors. Be constructive.",
        question
      ),
    ]);

    const initialAgents: AgentResult[] = [
      { id: "edith", name: "EDITH", role: "Research", response: edith },
      { id: "dume", name: "DUM-E", role: "Analysis", response: dume },
      { id: "u", name: "U", role: "Critic", response: u },
    ];

    // ULTRON compares the analyses.
    const ultron = await askModel(
      "You are ULTRON, STARK's adjudicator. Compare the responses. Identify agreement, disagreements, unsupported claims, and uncertainty. Agreement alone is not proof.",
      `QUESTION:\n${question}\n\n${initialAgents
        .map((a) => `${a.name}:\n${a.response}`)
        .join("\n\n")}`
    );

    const agents: AgentResult[] = [
      ...initialAgents,
      {
        id: "ultron",
        name: "ULTRON",
        role: "Adjudicator",
        response: ultron,
      },
    ];

    // FRIDAY produces the final answer.
    const friday = await askModel(
      "You are FRIDAY, STARK's coordinator. Write one clear, natural final answer using the council's analyses and ULTRON's assessment. Preserve uncertainty. Do not invent citations, browsing, or tests.",
      `USER QUESTION:\n${question}\n\nCOUNCIL:\n${agents
        .map((a) => `${a.name}:\n${a.response}`)
        .join("\n\n")}`
    );

    return NextResponse.json({
      answer: friday,
      model: MODEL,
      agents: [
        {
          id: "friday",
          name: "FRIDAY",
          role: "Coordinator",
          response: friday,
        },
        ...agents,
      ],
    });
  } catch (error) {
    console.error("STARK council error:", error);

    const message =
      error instanceof Error && error.name === "AbortError"
        ? "The AI request timed out. Try again or check Ollama."
        : "STARK could not complete the request. Check that Ollama is running and gemma3:4b is available.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
