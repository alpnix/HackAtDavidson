import { supabase } from "@/integrations/supabase/client";

export function getCoverUrl(coverUrl: string | null): string | null {
  if (!coverUrl) return null;
  const { data } = supabase.storage.from("blogs").getPublicUrl(coverUrl);
  return data.publicUrl;
}

export function authorLabel(profile: { firstname: string; lastname: string } | null): string {
  if (!profile) return "Unknown";
  return [profile.firstname, profile.lastname].filter(Boolean).join(" ").trim() || "Unknown";
}

export function stripHtml(html: string, maxLen: number): string {
  const plain = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length <= maxLen ? plain : plain.slice(0, maxLen) + "…";
}
