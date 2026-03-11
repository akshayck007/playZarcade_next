import { supabase } from "@/lib/supabase";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { data: settings } = await supabase
    .from("Settings")
    .select("*")
    .eq("id", "global")
    .maybeSingle();

  return <SettingsForm initialSettings={settings} />;
}
