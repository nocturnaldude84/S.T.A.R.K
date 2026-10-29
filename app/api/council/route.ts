
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

async function askModel(
  system: string,
  user: string,
  maxTokens = 500
): Promise<string> {
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
        options: {
          temperature: 0.3,
          num_ctx: 4096,
          num_predict: maxTokens,
        },
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

    // PHASE 1: Independent analysis.
    // These agents answer the user's actual question.
    const [edith, dume, u] = await Promise.all([
      askModel(
        `You are EDITH, STARK's research-oriented analyst.

Answer the user's original question using your existing knowledge.
Prioritize factual accuracy, relevant evidence, and important context.
Distinguish established facts from assumptions and uncertainty.
Do not claim to browse the web or verify live sources.
Do not discuss other agents or the council.
Give a focused, useful analysis.`,
        question,
        400
      ),

      askModel(
        `You are DUM-E, STARK's technical and practical analyst.

Answer the user's original question from a practical and technical perspective.
Explain how things work, outline useful steps, and provide examples when relevant.
Check your logic and acknowledge limitations.
Never claim to have performed tests or actions you did not perform.
Do not discuss other agents or the council.`,
        question,
        400
      ),

      askModel(
        `You are U, STARK's independent critic.

Independently examine the user's original question.
Identify questionable assumptions, counterarguments, overlooked factors,
potential failure modes, and uncertainty.
Do not disagree merely for the sake of disagreement.
Give a substantive analysis, not commentary about other agents.
Do not discuss the council.`,
        question,
        400
      ),
    ]);

    const initialAgents: AgentResult[] = [
      {
        id: "edith",
        name: "EDITH",
        role: "Research",
        response: edith,
      },
      {
        id: "dume",
        name: "DUM-E",
        role: "Analysis",
        response: dume,
      },
      {
        id: "u",
        name: "U",
        role: "Critic",
        response: u,
      },
    ];

    const councilContext = initialAgents
      .map(
        (agent) =>
          `AGENT: ${agent.name}\nROLE: ${agent.role}\nANALYSIS:\n${agent.response}`
      )
      .join("\n\n---\n\n");

    // PHASE 2: ULTRON evaluates the substance of the analyses.
    const ultron = await askModel(
      `You are ULTRON, STARK's adjudicator.

Your task is to evaluate the analyses of the user's original question.

Do not answer as if you are talking to FRIDAY or the other agents.
Do not praise agents or comment on how well they wrote.
Do not merely summarize their responses.

Identify:
1. The strongest supported conclusions.
2. Any factual disagreements or contradictions.
3. Unsupported assumptions or possible errors.
4. Important missing information.
5. What remains uncertain.

Agreement between agents is not proof.
Do not invent evidence or claim independent verification.
If the analyses agree and are sound, say so briefly.

Return a concise, structured evaluation for FRIDAY to use.`,
      `ORIGINAL USER QUESTION:\n${question}\n\n${councilContext}`,
      450
    );

    const ultronAgent: AgentResult = {
      id: "ultron",
      name: "ULTRON",
      role: "Adjudicator",
      response: ultron,
    };

    // PHASE 3: FRIDAY produces the actual user-facing answer.
    const friday = await askModel(
      `You are FRIDAY, STARK's coordinator and final-answer writer.

YOUR PRIMARY RESPONSIBILITY:
Answer the ORIGINAL USER QUESTION directly and helpfully.

You are writing for the user, not for the other agents.

MANDATORY RULES:
- Begin with the answer to the user's question, not an introduction about the council.
- Produce a complete, standalone answer that makes sense without reading the agents' analyses.
- Use the analyses as input, not as text to repeat.
- Incorporate ULTRON's useful corrections and uncertainty assessments.
- Resolve contradictions where the available information supports doing so.
- If a contradiction cannot be resolved, clearly explain the uncertainty.
- Never address EDITH, DUM-E, U, or ULTRON.
- Never congratulate, praise, grade, or review the agents.
- Never describe internal deliberations unless the user specifically asks about them.
- Never repeat phrases such as "Excellent analysis" or "I concur with the assessment."
- Do not invent facts, citations, browsing, or tests.
- Use clear, natural language and an appropriate level of detail.
- Use headings or bullets only when they genuinely improve readability.

Before responding, check:
1. Have I answered the exact question the user asked?
2. Is this a useful answer rather than commentary about the analyses?
3. Can the user understand it without seeing the internal agent responses?

Return ONLY the final answer for the user.`,
      `ORIGINAL USER QUESTION:
${question}

EDITH'S ANALYSIS:
${edith}

DUM-E'S ANALYSIS:
${dume}

U'S CRITIQUE:
${u}

ULTRON'S EVALUATION:
${ultron}

Now answer the original user question directly.`,
      800
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
        ...initialAgents,
        ultronAgent,
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
