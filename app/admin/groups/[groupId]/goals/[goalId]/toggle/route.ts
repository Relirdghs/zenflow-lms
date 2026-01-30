import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ groupId: string; goalId: string }> }
) {
  const { groupId, goalId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect("/login");

  const { data: goal } = await supabase
    .from("goals")
    .select("is_completed")
    .eq("id", goalId)
    .eq("group_id", groupId)
    .single();

  if (!goal) return NextResponse.redirect(`/admin/groups/${groupId}`);

  await supabase
    .from("goals")
    .update({ is_completed: !goal.is_completed })
    .eq("id", goalId)
    .eq("group_id", groupId);

  return NextResponse.redirect(`/admin/groups/${groupId}`);
}
