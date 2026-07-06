import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { buildLabReportPrompt, type BuildLabReportPromptInput } from "@/lib/ai/labReportPrompt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const aiInsightsSchema = z.object({
  provisionalDiagnosis: z.string().nullable(),
  patientInterpretation: z.string().nullable(),
  clinicalInterpretation: z.string().nullable(),
  tips: z.string().nullable(),
  doctorToVisit: z.string().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<BuildLabReportPromptInput>;

    if (!body.patient || !Array.isArray(body.testFindings)) {
      return NextResponse.json({ message: "patient and testFindings are required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "AI generation is not configured" }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });
    const messages = buildLabReportPrompt({
      patient: body.patient,
      testFindings: body.testFindings,
      history: body.history || [],
    });

    const completion = await client.chat.completions.create({
      model: "gpt-5",
      messages,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ message: "AI summarization failed" }, { status: 502 });
    }

    const parsed = aiInsightsSchema.parse(JSON.parse(raw));
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to generate AI report insights", error: errorMessage }, { status: 500 });
  }
}
