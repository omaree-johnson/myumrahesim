import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminReady } from '@/lib/supabase';

export async function GET() {
  const timestamp = new Date().toISOString();
  let database: { configured: boolean; status: 'ok' | 'unconfigured' | 'error'; error?: string } = {
    configured: false,
    status: 'unconfigured',
  };

  if (isSupabaseAdminReady()) {
    database.configured = true;
    try {
      // Lightweight connectivity check: run a simple query that doesn't depend on data
      const { error } = await supabaseAdmin.from('customers').select('id').limit(1).maybeSingle();
      if (error) {
        database.status = 'error';
        database.error = error.message;
      } else {
        database.status = 'ok';
      }
    } catch (err) {
      database.status = 'error';
      database.error = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  const overallOk = database.status !== 'error';
  return NextResponse.json(
    {
      status: overallOk ? 'ok' : 'degraded',
      timestamp,
      service: 'myumrahesim',
      database,
    },
    { status: overallOk ? 200 : 503 }
  );
}
