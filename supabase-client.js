import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zefzcmrsdvtbliguqedi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vGfAuyo4h18I-Pqmt25N0Q_OkEtlazb";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
