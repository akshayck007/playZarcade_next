import { supabase } from "@/lib/supabase";

export async function checkSections() {
  const { data, error } = await supabase
    .from("Section")
    .select("*")
    .order("order", { ascending: true });
  console.log("Current Sections in DB:", data);
  return data;
}
