import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { slug, narrative } = await req.json();

  if (!slug || !narrative) {
    return NextResponse.json(
      { error: "Missing slug or narrative" },
      { status: 400 }
    );
  }

  await supabaseAdmin
    .from("cold_cases")
    .update({ is_current: false })
    .eq("is_current", true);

  await supabaseAdmin
    .from("cold_cases")
    .insert({
      bill_slug: slug,
      featured_week: new Date().toISOString().split("T")[0],
      is_current: true,
      narrative,
    });

  return NextResponse.json({ success: true });
}