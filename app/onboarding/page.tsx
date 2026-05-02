'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const GENDER_OPTIONS = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: 'none', label: '선택 안함' },
]

const SENSITIVITY_OPTIONS = [
  { value: 'cold', label: '추위를 많이 타요 🥶' },
  { value: 'normal', label: '보통이에요 😊' },
  { value: 'hot', label: '더위를 많이 타요 🥵' },
]

interface AddressResult {
  address: string
  lat: number
  lon: number
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [sensitivity, setSensitivity] = useState('')
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState<AddressResult[]>([])
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 카카오 주소 검색
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

  const handleComplete = async (skipAddress = false) => {
    if (!nickname || !gender || !sensitivity) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        nickname,
        gender,
        temp_sensitivity: sensitivity,
        location_address: skipAddress ? null : selectedAddress?.address ?? null,
        location_lat: skipAddress ? null : selectedAddress?.lat ?? null,
        location_lon: skipAddress ? null : selectedAddress?.lon ?? null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      alert('저장 실패')
      setLoading(false)
      return
    }

    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#2C5F2E]">WEARTH</h1>
          <p className="text-gray-500 text-sm mt-1">{step}/4 단계</p>
          {/* 진행바 */}
          <div className="flex gap-1 mt-3 justify-center">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 w-12 rounded-full transition-colors ${
                  s <= step ? 'bg-[#2C5F2E]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 단계 1 — 닉네임 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">닉네임을 알려주세요</h2>
            <p className="text-sm text-gray-500 mb-6">코디 추천에 사용돼요</p>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E]"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!nickname}
              className="w-full mt-6 bg-[#2C5F2E] text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}

        {/* 단계 2 — 성별 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">성별을 선택해주세요</h2>
            <p className="text-sm text-gray-500 mb-6">맞춤 코디 추천에 활용돼요</p>
            <div className="space-y-3">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors ${
                    gender === opt.value
                      ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500"
              >
                이전
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!gender}
                className="flex-1 py-3 rounded-xl bg-[#2C5F2E] text-white text-sm font-medium disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* 단계 3 — 체온 민감도 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">체온 민감도를 알려주세요</h2>
            <p className="text-sm text-gray-500 mb-6">날씨 기반 코디 추천을 더 정확하게 해줘요</p>
            <div className="space-y-3">
              {SENSITIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSensitivity(opt.value)}
                  className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors ${
                    sensitivity === opt.value
                      ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500"
              >
                이전
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!sensitivity}
                className="flex-1 py-3 rounded-xl bg-[#2C5F2E] text-white text-sm font-medium disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* 단계 4 — 주소 입력 */}
        {step === 4 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">자주 있는 위치를 알려주세요</h2>
            <p className="text-sm text-gray-500 mb-6">
              GPS가 기본이지만, 주소를 등록하면 해당 위치 날씨로 우선 제공돼요
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
                placeholder="주소 검색 (예: 강남구 역삼동)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E]"
              />
              <button
                onClick={searchAddress}
                disabled={searchLoading}
                className="bg-[#2C5F2E] text-white px-4 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                검색
              </button>
            </div>

            {/* 검색 결과 */}
            {addressResults.length > 0 && (
              <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                {addressResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedAddress(result)
                      setAddressResults([])
                      setAddressQuery(result.address)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 last:border-0 transition-colors ${
                      selectedAddress?.address === result.address
                        ? 'bg-[#F5F0E8] text-[#2C5F2E]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {result.address}
                  </button>
                ))}
              </div>
            )}

            {selectedAddress && (
              <div className="bg-[#F5F0E8] rounded-xl px-4 py-3 text-sm text-[#2C5F2E] mb-4">
                ✅ {selectedAddress.address}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500"
              >
                이전
              </button>
              <button
                onClick={() => handleComplete(false)}
                disabled={!selectedAddress || loading}
                className="flex-1 py-3 rounded-xl bg-[#2C5F2E] text-white text-sm font-medium disabled:opacity-50"
              >
                {loading ? '저장 중...' : '시작하기'}
              </button>
            </div>

            <button
              onClick={() => handleComplete(true)}
              className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600"
            >
              건너뛰기 (GPS만 사용)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}