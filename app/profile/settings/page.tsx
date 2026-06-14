'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, Calendar, Lock, Eye, EyeOff } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function AccountSettingsPage() {
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      setEmail(user.email ?? '')
      if (user.created_at) {
        const date = new Date(user.created_at)
        setCreatedAt(`${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`)
      }
      setInitialLoading(false)
    }

    fetchUser()
  }, [])

  const handlePasswordChange = async () => {
    setError('')
    setMessage('')

    if (!newPassword || !confirmPassword) {
      setError('비밀번호를 입력해주세요.')
      return
    }
    if (newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      setError('비밀번호 변경에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    setMessage('비밀번호가 변경되었어요.')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <p className="text-gray-300 text-sm">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/profile')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">계정 설정</h1>
        </div>

        {/* 계정 정보 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
          <p className="text-sm font-medium text-gray-700 mb-3">계정 정보</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Mail size={15} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">이메일</p>
                <p className="text-sm font-medium text-gray-700">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Calendar size={15} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">가입일</p>
                <p className="text-sm font-medium text-gray-700">{createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={15} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-700">비밀번호 변경</p>
          </div>
          <p className="text-xs text-gray-400 mb-4">6자 이상으로 설정해주세요</p>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호"
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
            />

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
              onClick={handlePasswordChange}
              disabled={loading}
              className="w-full bg-[#2C5F2E] text-white rounded-xl py-3.5 text-sm font-semibold disabled:opacity-50 hover:bg-[#234d25] transition-colors"
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}