import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// We export the supabase client for realtime channels in the UI
export const supabase = createClient(supabaseUrl, supabaseKey);
