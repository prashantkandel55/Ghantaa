import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: NextRequest) {
  const { data: logs, error } = await supabase
    .from('admin_audit_log')
    .select('*, employees(name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(logs || []), { status: 200 });
}
