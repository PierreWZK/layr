import { NextResponse } from "next/server";

// Réponses JSON et lecture du corps, partagées par toutes les routes /api
export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export const error = (code: string, status: number) => NextResponse.json({ error: code }, { status });

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
export const SLUG = /^[a-z0-9-]{1,80}$/;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
