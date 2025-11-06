// Flávia Glenda e Lucas Randal
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bmoynkkztvzvvfpjizol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtb3lua2t6dHZ6dnZmcGppem9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDY2NDQsImV4cCI6MjA3NzgyMjY0NH0.4X8MVAQpfG-mNJW7EMHD8oVs1xZPOSxFcDUEidv0qO4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
