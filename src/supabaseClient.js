import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const configured = Boolean(url && /^https:\/\//.test(url) && key);
export const supabase = configured ? createClient(url, key, {
  auth: { persistSession: true, storage: window.sessionStorage, autoRefreshToken: true, detectSessionInUrl: false }
}) : null;
