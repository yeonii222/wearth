'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'

const STYLES = [
  { value: 'casual', label: '일상', emoji: '👕' },
  { value: 'formal', label: '출근', emoji: '👔' },
  { value: 'date', label: '데이트', emoji: '✨' },
  { value: 'sporty', label: '운동', emoji: '🏃' },
]

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  top: { label: '상의', emoji: '👕' },
  bottom: { label: '하의', emoji: '👖' },
  outer: { label: '아우터', emoji: '🧥' },
  footwear: { label: '신발', emoji: '👟' },
  accessories: { label: '액세서리', emoji: '🧣' },
}

interface ClothesItem {
  id: string
  name: string | null
  image_url: string | null
  category: string
  color: string | null
  material: string | null
  input_type: string
}

interface OutfitResult {
  tempCode: string
  top: string[]
  bottom: string[]
  outer: string[]
  footwear: string[]
  accessories: string[]
  weatherWarning?: string
  matchedClothes: Record<string, ClothesItem[]>
}

export default function OutfitPage() {
  const [selectedStyle, setSelectedStyle] = useState('casual')
  const [outfit, setOutfit] = useState<OutfitResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [locationLabel, setLocationLabel] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      if (profileData?.location_address) {
        setLocationLabel(profileData.location_address)
      }

      // 저장된 주소 좌표 우선, 없으면 GPS
      if (profileData?.location_lat && profileData?.location_lon) {
        const res = await fetch(`/api/weather?lat=${profileData.location_lat}&lon=${profileData.location_lon}`)
        const weatherData = await res.json()
        setWeather(weatherData)
      } else {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords
          const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
          const weatherData = await res.json()
          setWeather(weatherData)
        })
      }
    }
    init()
  }, [])

  const getOutfit = async () => {
    if (!weather || !profile) return
    setLoading(true)

    const res = await fetch('/api/outfit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weather: {
          temp: weather.temp,
          feels_like: weather.feels_like,
          humidity: weather.humidity,
          wind_speed: weather.wind_speed,
        },
        gender: profile.gender,
        style: selectedStyle,
        sensitivity: profile.temp_sensitivity,
      }),
    })

    const data = await res.json()
    setOutfit(data)
    setLoading(false)
  }

  useEffect(() => {
    if (weather && profile) getOutfit()
  }, [weather, profile, selectedStyle])

  const CategorySection = ({ categoryKey }: { categoryKey: string }) => {
    const { label, emoji } = CATEGORY_LABELS[categoryKey]
    const recommendedItems = outfit?.[categoryKey as keyof OutfitResult] as string[] || []
    const matchedItems = outfit?.matchedClothes?.[categoryKey] || []
    const hasMatch = matchedItems.length > 0

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-3">{emoji} {label}</p>

        {hasMatch ? (
          // 옷장에 아이템이 있을 때
          <div className="flex gap-3 overflow-x-auto pb-2">
            {matchedItems.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-24">
                {item.image_url ? (
                  // 사진 등록 아이템
                  <img
                    src={item.image_url}
                    alt={item.name || item.category}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                  />
                ) : (
                  // 텍스트 등록 아이템
                  <div className="w-24 h-24 rounded-xl border border-gray-100 bg-[#F5F0E8] flex flex-col items-center justify-center p-2">
                    <span className="text-2xl mb-1">{emoji}</span>
                    <p className="text-xs text-gray-600 text-center leading-tight truncate w-full text-center">
                      {item.name || item.category}
                    </p>
                  </div>
                )}
                {item.color && (
                  <p className="text-xs text-gray-400 text-center mt-1">{item.color}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          // 옷장에 아이템이 없을 때 — 추천 텍스트
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl opacity-30">{emoji}</span>
              <p className="text-xs text-gray-400">옷장에 없어요</p>
            </div>
            {recommendedItems.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recommendedItems.slice(0, 3).map((item, i) => (
                  <span key={i} className="text-xs bg-white text-gray-500 px-2 py-1 rounded-full border border-gray-200">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        <h1 className="text-xl font-bold text-gray-800 mb-6">오늘의 코디</h1>

        {/* 날씨 요약 */}
        {weather && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{locationLabel || weather.city}</p>
              <p className="text-2xl font-bold text-gray-800">{weather.temp}°</p>
              <p className="text-xs text-gray-400">체감 {weather.feels_like}°</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{weather.description}</p>
              <p className="text-xs text-gray-400">습도 {weather.humidity}%</p>
              <p className="text-xs text-gray-400">바람 {weather.wind_speed}m/s</p>
            </div>
          </div>
        )}

        {/* 날씨 경고 */}
        {outfit?.weatherWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700">
            {outfit.weatherWarning}
          </div>
        )}

        {/* 외출 목적 선택 */}
        <div className="flex gap-2 mb-6">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStyle(s.value)}
              className={`flex-1 py-3 rounded-xl text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                selectedStyle === s.value
                  ? 'bg-[#2C5F2E] text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              <span className="text-lg">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* 코디 추천 결과 */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">코디 추천 중...</div>
        ) : outfit ? (
          <div className="space-y-3">
            {Object.keys(CATEGORY_LABELS).map((key) => (
              <CategorySection key={key} categoryKey={key} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">날씨 정보를 불러오는 중...</div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}