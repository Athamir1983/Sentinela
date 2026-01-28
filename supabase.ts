import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Busca as variáveis do ambiente (Cloudflare ou arquivo .env)
const SUPABASE_URL = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Erro: Variáveis do Supabase não encontradas!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
