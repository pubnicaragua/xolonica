import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mptnhektozvjowoydjha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdG5oZWt0b3p2am93b3lkamhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDI1NjUsImV4cCI6MjA4MDg3ODU2NX0.3x9Z3IAJL88-Jk7bwaBfbr4ZD-UlQ3g1USf2h8BQ_DA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
