import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = !!url && !!anonKey;

if (!supabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase is not configured. Copy .env.example to .env and fill in ' +
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from your Supabase project settings.'
  );
}

// Falls back to harmless placeholder values when unconfigured so the app can
// still boot and show a clear "not configured" screen instead of crashing.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
);
