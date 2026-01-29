import { supabase } from "@/integrations/supabase/client";

export function getFormCoverUrl(coverUrl: string | null): string | null {
  if (!coverUrl) return null;
  const { data } = supabase.storage.from("form-covers").getPublicUrl(coverUrl);
  return data.publicUrl;
}
