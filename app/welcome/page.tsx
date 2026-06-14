'use client'

import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#1A3D1C] flex flex-col items-center justify-center px-6 py-12">

      {/* 로고 영역 */}
      <div className="flex flex-col items-center gap-3 mb-16">
        <h1 className="text-7xl font-bold tracking-tight text-white">
          WEARTH
        </h1>
        <p className="text-xl font-light tracking-widest text-white/60">
          오늘 날씨, 오늘 코디
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => router.push('/auth/login')}
          className="w-full bg-white text-[#1A3D1C] rounded-xl py-4 text-sm font-semibold hover:bg-gray-100 transition-colors"
        >
          로그인
        </button>
        <button
          onClick={() => router.push('/auth/login?mode=signup')}
          className="w-full border border-white/30 text-white rounded-xl py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          회원가입
        </button>
      </div>

    </div>
  )
}