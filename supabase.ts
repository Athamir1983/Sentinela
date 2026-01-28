
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const SUPABASE_URL = 'https://negmhejwqlvmywcwvurw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ21oZWp3cWx2bXl3Y3d2dXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzY1ODIsImV4cCI6MjA4NDc1MjU4Mn0.L5-RJEQDhx8Cqpspia1CeEpL3LGidvIXDzDpjIvYhz4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
