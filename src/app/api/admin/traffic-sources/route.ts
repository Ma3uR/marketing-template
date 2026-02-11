import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTrafficSources, type Period } from '@/lib/google-analytics';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d'];

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email as string)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const period = (request.nextUrl.searchParams.get('period') || '7d') as Period;
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
  }

  try {
    const sources = await getTrafficSources(period);
    return NextResponse.json({ sources });
  } catch (err) {
    console.error('GA4 API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 502 }
    );
  }
}
