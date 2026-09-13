'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'

const STYLES = [
  { value: 'casual', label: '일상' },
  { value: 'formal', label: '출근' },
  { value: 'date', label: '데이트' },
  { value: 'sporty', label: '운동' },
]

const CATEGORY_LABELS: Record<string, string> = {
  top: '상의',
  bottom: '하의',
  footwear: '신발',
  accessories: '액세서리',
}

interface ClothesItem {
  id: string
  name: string | null
  image_url: string | null
  category: string
  color: string | null
  length: string | null
  sub_category: string | null
}

interface OutfitResult {
  tempCode: string
  top: string[]
  bottom: string[]
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

  // 각 카테고리에서 현재 선택된 아이템 id (스와핑 상태)
  const [selectedItems, setSelectedItems] = useState<Record<string, string | null>>({
    top: null,
    bottom: null,
    footwear: null,
    accessories: null,
  })

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

    const data: OutfitResult = await res.json()
    setOutfit(data)

    // 각 카테고리의 첫 번째 아이템을 기본 선택값으로 설정
    const initialSelection: Record<string, string | null> = {}
    Object.keys(CATEGORY_LABELS).forEach((key) => {
      const items = data.matchedClothes?.[key] || []
      initialSelection[key] = items.length > 0 ? items[0].id : null
    })
    setSelectedItems(initialSelection)

    setLoading(false)
  }

  useEffect(() => {
    if (weather && profile) getOutfit()
  }, [weather, profile, selectedStyle])

  const CategorySection = ({ categoryKey }: { categoryKey: string }) => {
    const label = CATEGORY_LABELS[categoryKey]
    const recommendedItems = outfit?.[categoryKey as keyof OutfitResult] as string[] || []
    const matchedItems = outfit?.matchedClothes?.[categoryKey] || []
    const hasMatch = matchedItems.length > 0
    const selectedId = selectedItems[categoryKey]
    const selectedItem = matchedItems.find((i) => i.id === selectedId)

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>

        {hasMatch ? (
          <>
            {/* 현재 선택된 아이템 - 크게 표시 */}
            {selectedItem && (
              <div className="mb-3 flex items-center gap-3 bg-[#F5F0E8] rounded-xl p-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                  {selectedItem.image_url ? (
                    <img src={selectedItem.image_url} alt={selectedItem.name || ''} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-[#2C5F2E]">
                      {selectedItem.category?.[0] ?? '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{selectedItem.name || selectedItem.category}</p>
                  <p className="text-xs text-gray-400">{selectedItem.color}{selectedItem.sub_category ? ` · ${selectedItem.sub_category}` : ''}</p>
                </div>
              </div>
            )}

            {/* 스와핑 가능한 옵션들 - 가로 스크롤 */}
            {matchedItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {matchedItems.map((item) => {
                  const isSelected = item.id === selectedId
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItems((prev) => ({ ...prev, [categoryKey]: item.id }))}
                      className="flex-shrink-0 w-16"
                    >
                      <div
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-[#2C5F2E]' : 'border-gray-100'
                        } bg-[#F5F0E8]`}
                      >
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name || ''} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-[#2C5F2E]">
                            {item.category?.[0] ?? '?'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 text-center mt-1 truncate">
                        {item.name || item.category}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">옷장에 없어요</p>
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

        {outfit?.weatherWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700">
            {outfit.weatherWarning}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStyle(s.value)}
              className={`flex-1 py-3 rounded-xl text-xs font-medium transition-colors ${
                selectedStyle === s.value
                  ? 'bg-[#2C5F2E] text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

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