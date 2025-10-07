// Supabase client configuration
// NOTE: This project should not use VITE_* env vars. Using fixed project values instead.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lgmiuthksmbfbeztejgw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbWl1dGhrc21iZmJlenRlamd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDgxMTksImV4cCI6MjA3NTQyNDExOX0._uFN16fAJb4za7Qx_SGPnrtQSo_S_t9cdeyACTS64AM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});