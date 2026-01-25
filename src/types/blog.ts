import type { Tables } from "@/integrations/supabase/types";

export type BlogWithCreator = Tables<"blogs"> & {
  profile: { firstname: string; lastname: string } | null;
};
