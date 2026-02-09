import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/');

  // Allow auth callbacks to proceed
  if (isAuthCallback) {
    return supabaseResponse;
  }

  // If accessing admin routes (except login) without being authenticated
  if (isAdminRoute && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // If authenticated user tries to access login page, redirect to admin dashboard
  if (isLoginPage && user) {
    // Check if user is in admin_users table
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email)
      .single();

    if (adminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  // For authenticated admin routes, verify user is an admin
  if (isAdminRoute && !isLoginPage && user) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email)
      .single();

      console.log('adminUser', adminUser);

    if (!adminUser) {
      // User is authenticated but not an admin
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'not_admin');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
