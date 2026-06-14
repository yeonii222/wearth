'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Search, Check, X } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const GENDER_OPTIONS = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: 'none', label: '선택 안함' },
]

const SENSITIVITY_OPTIONS = [
  { value: 'cold', label: '추위를 많이 타요' },
  { value: 'normal', label: '보통이에요' },
  { value: 'hot', label: '더위를 많이 타요' },
]

interface AddressResult {
  address: string
  lat: number
  lon: number
}

export default function ProfileEditPage() {
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [sensitivity, setSensitivity] = useState('')
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState<AddressResult[]>([])
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('nickname, gender, temp_sensitivity, location_address, location_lat, location_lon')
        .eq('id', user.id)
        .single()

      if (data) {
        setNickname(data.nickname ?? '')
        setGender(data.gender ?? '')
        setSensitivity(data.temp_sensitivity ?? '')
        if (data.location_address) {
          setAddressQuery(data.location_address)
          setSelectedAddress({
            address: data.location_address,
            lat: data.location_lat,
            lon: data.location_lon,
          })
        }
      }
      setInitialLoading(false)
    }

    fetchProfile()
  }, [])

  const searchAddress = async () => {
    if (!addressQuery) return
    setSearchLoading(true)
    const res = await fetch(`/api/address?query=${encodeURIComponent(addressQuery)}`)
    const data = await res.json()
    if (data.documents) {
      setAddressResults(
        data.documents.map((doc: any) => ({
          address: doc.address_name,
          lat: parseFloat(doc.y),
          lon: parseFloat(doc.x),
        }))
      )
    }
    setSearchLoading(false)
  }

  const handleSave = async () => {
    if (!nickname || !gender || !sensitivity) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      nickname,
      gender,
      temp_sensitivity: sensitivity,
      location_address: selectedAddress?.address ?? null,
      location_lat: selectedAddress?.lat ?? null,
      location_lon: selectedAddress?.lon ?? null,
      updated_at: new Date().toISOString(),
    })

    if (error) { alert('저장 실패'); setLoading(false); return }
    router.push('/profile')
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
          <h1 className="text-xl font-bold text-gray-900">프로필 수정</h1>
        </div>

        {/* 닉네임 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 입력"
            className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
          />
        </div>

        {/* 성별 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-3">성별</label>
          <div className="space-y-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGender(opt.value)}
                className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-between px-4 ${
                  gender === opt.value
                    ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span>{opt.label}</span>
                {gender === opt.value && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* 체온 민감도 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-3">체온 민감도</label>
          <div className="space-y-2">
            {SENSITIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSensitivity(opt.value)}
                className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-between px-4 ${
                  sensitivity === opt.value
                    ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span>{opt.label}</span>
                {sensitivity === opt.value && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* 위치 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">기본 위치</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
              placeholder="주소 검색 (예: 강남구 역삼동)"
              className="flex-1 border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
            />
            <button
              onClick={searchAddress}
              disabled={searchLoading}
              className="bg-[#2C5F2E] text-white px-4 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
            >
              <Search size={14} />
              검색
            </button>
          </div>

          {addressResults.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
              {addressResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedAddress(result)
                    setAddressResults([])
                    setAddressQuery(result.address)
                  }}
                  className="w-full text-left px-4 py-3 text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  {result.address}
                </button>
              ))}
            </div>
          )}

          {selectedAddress && (
            <div className="bg-[#F0F5F0] rounded-xl px-4 py-3 text-sm text-[#2C5F2E] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Check size={14} />
                {selectedAddress.address}
              </span>
              <button
                onClick={() => {
                  setSelectedAddress(null)
                  setAddressQuery('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {!selectedAddress && (
            <p className="text-xs text-gray-400 mt-1">위치를 등록하지 않으면 GPS를 사용해요</p>
          )}
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={!nickname || !gender || !sensitivity || loading}
          className="w-full bg-[#2C5F2E] text-white rounded-xl py-4 font-semibold disabled:opacity-40 transition-colors hover:bg-[#234d25]"
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>

      </div>

      <BottomNav />
    </div>
  )
}