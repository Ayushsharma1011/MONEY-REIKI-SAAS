import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function getPublicAssetUrl(bucket: string, path: string) {
  const supabase = createSupabaseBrowserClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
