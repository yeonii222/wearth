'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'

type Mode = 'login' | 'signup' | 'reset'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState<Mode>(initialMode) 
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) setError('이메일 발송에 실패했어요. 다시 시도해주세요.')
      else setMessage('비밀번호 재설정 링크를 이메일로 보냈어요!')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError('가입이 완료되었습니다. 로그인해주세요.'); setLoading(false); return }
      router.push('/onboarding')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('이메일 또는 비밀번호를 확인해주세요.'); setLoading(false); return }
    router.push('/home')
    setLoading(false)
  }

  const titles: Record<Mode, string> = {
    login: '로그인',
    signup: '회원가입',
    reset: '비밀번호 찾기',
  }

  const buttonLabels: Record<Mode, string> = {
    login: '로그인',
    signup: '회원가입',
    reset: '재설정 링크 받기',
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#2C5F2E] tracking-tight">WEARTH</h1>
          <p className="text-sm text-gray-400 mt-2">오늘 날씨, 오늘 코디</p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white rounded-2xl p-7 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">{titles[mode]}</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
                placeholder="이메일 입력"
                required
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
                  placeholder="비밀번호 입력"
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 rounded-xl px-4 py-3">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
            {message && (
              <div className="bg-green-50 rounded-xl px-4 py-3">
                <p className="text-xs text-green-600">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2C5F2E] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#234d25] transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? '처리 중...' : buttonLabels[mode]}
            </button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-gray-50">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                  className="w-full text-sm text-gray-500 hover:text-gray-800 transition-colors py-1"
                >
                  계정이 없으신가요? <span className="font-medium text-[#2C5F2E]">회원가입</span>
                </button>
                <button
                  onClick={() => { setMode('reset'); setError(''); setMessage('') }}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </>
            )}
            {(mode === 'signup' || mode === 'reset') && (
              <button
                onClick={() => { setMode('login'); setError(''); setMessage('') }}
                className="w-full text-sm text-gray-500 hover:text-gray-800 transition-colors py-1"
              >
                <span className="font-medium text-[#2C5F2E]">로그인</span>으로 돌아가기
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}