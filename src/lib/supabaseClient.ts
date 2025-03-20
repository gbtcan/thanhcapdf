// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fwoxlggleieoztmcvsju.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b3hsZ2dsZWllb3p0bWN2c2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTY1OTUsImV4cCI6MjA1Njg5MjU5NX0.2I1OSvsQg0F6OEAeDSVSdIJfJWPPNjlLB7OhCaigEPI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);