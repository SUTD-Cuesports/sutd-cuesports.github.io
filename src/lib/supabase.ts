import { createClient } from "@supabase/supabase-js";

const PROJECT_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!PROJECT_URL || !ANON_KEY) throw new Error("Missing supabase information");

export const supabase = createClient(PROJECT_URL, ANON_KEY);
