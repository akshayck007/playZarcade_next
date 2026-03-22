import { supabase } from "@/lib/supabase";
import { SeoManagerClient } from "@/components/admin/SeoManagerClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminSeoPagesPage() {
  const { data: seoPagesRaw } = await supabase
    .from("SeoPage")
    .select("*, Game(*)")
    .order("createdAt", { ascending: false });

  const seoPages = (seoPagesRaw || []).map(p => ({ ...p, game: p.Game }));

  return <SeoManagerClient initialSeoPages={seoPages} />;
}
