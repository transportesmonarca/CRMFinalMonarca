import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { confirm } = body || {};
    if (!confirm) {
      return NextResponse.json({ error: "Missing confirmation" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ... tus deletes como ya los tenías ...
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Cleanup failed" }, { status: 500 });
  }
}