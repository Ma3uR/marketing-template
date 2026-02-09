import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTemplatedEmail } from '@/lib/send-email';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email as string)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { templateSlug, to, variables } = body;

    if (!templateSlug || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: templateSlug, to' },
        { status: 400 }
      );
    }

    const result = await sendTemplatedEmail({
      templateSlug,
      to,
      variables: variables || {},
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Template not found or email send failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
