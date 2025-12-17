import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://yachmbljmjwwtuqzldul.supabase.co';
const supabaseKey = 'sb_publishable_ycqNi2d-OAoVCuxd-WRySQ_P-_-GXQb';

export const supabase = createClient(supabaseUrl, supabaseKey);
