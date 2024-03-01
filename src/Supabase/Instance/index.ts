import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_PROJECT_URL || !process.env.SUPABASE_PROJECT_KEY) {
    throw new Error('Supabase envs not setted properly');
}

export const client = createClient(
    process.env.SUPABASE_PROJECT_URL,
    process.env.SUPABASE_PROJECT_KEY
);
