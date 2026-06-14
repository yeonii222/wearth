'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { LogOut, ChevronRight, Settings, Camera, User } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

interface Profile {
  nickname: string | null
  gender: string | null
  temp_sensitivity: string | null
  location_address: string | null
  avatar_url: string | null
}

const GENDER_LABEL: Record<string, string> = {
  female: '여성',
  male: '남성',
  none: '선택 안함',
}

const SENSITIVITY_LABEL: Record<string, string> = {
  cold: '추위를 많이 타요',
  normal: '보통이에요',
  hot: '더위를 많이 타요',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email ?? '')

      const { data } = await supabase
        .from('profiles')
        .select('nickname, gender, temp_sensitivity, location_address, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/welcome')
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `avatars/${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      alert('이미지 업로드 실패')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      alert('프로필 업데이트 실패')
      setUploading(false)
      return
    }

    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : prev)
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">프로필</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-300 text-sm">불러오는 중...</div>
        ) : (
          <>
            {/* 프로필 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-3">
              <div className="flex items-center gap-4 mb-6">

                {/* 아바타 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 group"
                >
                  {profile?.avatar_url ? (
                   <img src={profile.avatar_url} alt="프로필 사진" className="w-full h-full object-cover" />
                  ) : (
                   <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={28} className="text-gray-400" />
                   </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                    <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                <div>
                  <p className="font-bold text-gray-900 text-lg">{profile?.nickname ?? '닉네임 없음'}</p>
                  <p className="text-gray-400 text-sm">{email}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-50 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">성별</p>
                  <p className="text-sm font-medium text-gray-700">
                    {profile?.gender ? GENDER_LABEL[profile.gender] : '미설정'}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">체온 민감도</p>
                  <p className="text-sm font-medium text-gray-700">
                    {profile?.temp_sensitivity ? SENSITIVITY_LABEL[profile.temp_sensitivity] : '미설정'}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">기본 위치</p>
                  <p className="text-sm font-medium text-gray-700 text-right max-w-[60%]">
                    {profile?.location_address ?? 'GPS 사용 중'}
                  </p>
                </div>
              </div>

              {/* 계정 설정 항목 */}
              <button
                onClick={() => router.push('/profile/settings')}
                className="w-full flex items-center justify-between border-t border-gray-50 pt-4 mt-4 text-left"
              >
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings size={15} className="text-gray-400" />
                  계정 설정
                </span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            </div>

            {/* 프로필 수정 버튼 */}
            <button
              onClick={() => router.push('/profile/edit')}
              className="w-full bg-[#2C5F2E] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#234d25] transition-colors flex items-center justify-center gap-1"
            >
              프로필 수정
              <ChevronRight size={16} />
            </button>
          </>
        )}

      </div>

      <BottomNav />
    </div>
  )
}