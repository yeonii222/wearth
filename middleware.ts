import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 로그인 안 된 상태에서 보호된 페이지 접근 시 커버 화면으로
  if (!user && !request.nextUrl.pathname.startsWith('/auth') && !request.nextUrl.pathname.startsWith('/welcome')) {
    const url = request.nextUrl.clone()
    url.pathname = '/welcome'
    return NextResponse.redirect(url)
  }

  // 로그인 된 상태에서 온보딩/홈 접근 시 프로필 완성 여부에 따라 분기
  if (user && (request.nextUrl.pathname.startsWith('/home') || request.nextUrl.pathname.startsWith('/onboarding'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, nickname, gender, temp_sensitivity')
      .eq('id', user.id)
      .single()

    // 온보딩 필수 정보(닉네임, 성별, 체온민감도)가 모두 있어야 완료로 간주
    const isOnboarded = !!(profile?.nickname && profile?.gender && profile?.temp_sensitivity)

    // 프로필 미완성 상태에서 /home 접근 → 온보딩으로
    if (!isOnboarded && request.nextUrl.pathname.startsWith('/home')) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // 온보딩 완료 상태에서 /onboarding 접근 → 홈으로
    if (isOnboarded && request.nextUrl.pathname.startsWith('/onboarding')) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/home/:path*', '/closet/:path*', '/onboarding', '/profile/:path*', '/welcome'],
}