'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'signup' | 'reset'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('login')
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

    // 비밀번호 재설정 이메일 발송
    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) setError('이메일 발송에 실패했어요. 다시 시도해주세요.')
      else setMessage('비밀번호 재설정 링크를 이메일로 보냈어요!')
      setLoading(false)
      return
    }

    // 회원가입
    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('가입이 완료되었습니다. 로그인해주세요.')
        setLoading(false)
        return
      }
      router.push('/onboarding')
      return
    }

    // 로그인
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호를 확인해주세요.')
      setLoading(false)
      return
    }
    router.push('/home')
    setLoading(false)
  }

  const title = mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '비밀번호 찾기'
  const buttonLabel = mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '재설정 링크 받기'

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2C5F2E]">WEARTH</h1>
          <p className="text-gray-600 mt-2">오늘 날씨, 오늘 코디</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E]"
                placeholder="이메일 입력"
                required
              />
            </div>

            {/* 비밀번호 찾기 모드에서는 비밀번호 입력 숨김 */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E]"
                  placeholder="비밀번호 입력"
                  required
                />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2C5F2E] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#234d25] transition-colors disabled:opacity-50"
            >
              {loading ? '처리 중...' : buttonLabel}
            </button>
          </form>

          {/* 하단 네비게이션 */}
          <div className="mt-4 flex flex-col gap-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  계정이 없으신가요? 회원가입
                </button>
                <button
                  onClick={() => { setMode('reset'); setError(''); setMessage('') }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </>
            )}
            {(mode === 'signup' || mode === 'reset') && (
              <button
                onClick={() => { setMode('login'); setError(''); setMessage('') }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                로그인으로 돌아가기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}