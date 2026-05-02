'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'

interface Profile {
  nickname: string | null
  gender: string | null
  temp_sensitivity: string | null
  location_address: string | null
}

const GENDER_LABEL: Record<string, string> = {
  female: '여성',
  male: '남성',
  none: '선택 안함',
}

const SENSITIVITY_LABEL: Record<string, string> = {
  cold: '추위를 많이 타요 🥶',
  normal: '보통이에요 😊',
  hot: '더위를 많이 타요 🥵',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setEmail(user.email ?? '')

      const { data } = await supabase
        .from('profiles')
        .select('nickname, gender, temp_sensitivity, location_address')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        {/* 헤더 */}
        <h1 className="text-xl font-bold text-gray-800 mb-6">프로필</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <>
            {/* 프로필 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#2C5F2E] flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.nickname?.[0] ?? '?'}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{profile?.nickname ?? '닉네임 없음'}</p>
                  <p className="text-gray-400 text-sm">{email}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">성별</p>
                  <p className="text-sm font-medium text-gray-700">
                    {profile?.gender ? GENDER_LABEL[profile.gender] : '미설정'}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">체온 민감도</p>
                  <p className="text-sm font-medium text-gray-700">
                    {profile?.temp_sensitivity ? SENSITIVITY_LABEL[profile.temp_sensitivity] : '미설정'}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">기본 위치</p>
                  <p className="text-sm font-medium text-gray-700 text-right max-w-[60%]">
                    {profile?.location_address ?? 'GPS 사용 중'}
                  </p>
                </div>
              </div>
            </div>

            {/* 프로필 수정 버튼 */}
            <button
              onClick={() => router.push('/profile/edit')}
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium mb-3 hover:bg-gray-50 transition-colors"
            >
              프로필 수정
            </button>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="w-full bg-white border border-red-100 text-red-400 rounded-xl py-3 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              로그아웃
            </button>
          </>
        )}

      </div>

      <BottomNav />
    </div>
  )
}