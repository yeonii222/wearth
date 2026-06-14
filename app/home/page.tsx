'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, ChevronRight, Plus, Thermometer, Droplets, Wind } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

interface WeatherData {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  description: string
  icon: string
  humidity: number
  wind_speed: number
  city: string
}

interface ClothingItem {
  id: string
  name: string | null
  category: string
  color: string | null
  image_url: string | null
}

const getWeatherEmoji = (icon: string): string => {
  if (icon.includes('01')) return '☀️'
  if (icon.includes('02') || icon.includes('03')) return '⛅'
  if (icon.includes('04')) return '☁️'
  if (icon.includes('09') || icon.includes('10')) return '🌧'
  if (icon.includes('11')) return '⛈'
  if (icon.includes('13')) return '❄️'
  return '🌤'
}

const getWeatherComment = (temp: number, tempMin: number, tempMax: number): string => {
  const diff = tempMax - tempMin
  if (temp >= 28) return '얇고 통기성 좋은 옷을 추천해요'
  if (temp >= 23) return diff >= 8 ? '일교차가 커요. 얇은 겉옷을 챙기세요' : '가볍게 입기 좋은 날씨예요'
  if (temp >= 17) return '겉옷 하나 챙기면 딱 좋아요'
  if (temp >= 12) return '레이어드 코디가 잘 어울리는 날씨예요'
  if (temp >= 7) return '두꺼운 아우터가 필요해요'
  return '최대한 따뜻하게 입으세요'
}

const CATEGORY_LABEL: Record<string, string> = {
  '상의': '상의',
  '하의': '하의',
  '아우터': '아우터',
  '신발': '신발',
  '액세서리': '액세서리',
}

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [locationLabel, setLocationLabel] = useState('')
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [nickname, setNickname] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('location_lat, location_lon, location_address, nickname')
        .eq('id', user.id)
        .single()

      if (profile?.nickname) setNickname(profile.nickname)
      if (profile?.location_address) setLocationLabel(profile.location_address)

      const { data: clothesData } = await supabase
        .from('clothes')
        .select('id, name, category, color, image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (clothesData) setClothes(clothesData)

      if (profile?.location_lat && profile?.location_lon) {
        const res = await fetch(`/api/weather?lat=${profile.location_lat}&lon=${profile.location_lon}`)
        const data = await res.json()
        setWeather(data)
        setWeatherLoading(false)
      } else {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
            const data = await res.json()
            setWeather(data)
            setWeatherLoading(false)
          },
          () => setWeatherLoading(false)
        )
      }
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('welcome')
  }

  const recentClothes = clothes.slice(0, 3)
  const totalCount = clothes.length
  const needsMore = totalCount < 5
  const remaining = 5 - totalCount

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2C5F2E] tracking-tight">WEARTH</h1>
            {nickname && (
              <p className="text-sm text-gray-400 mt-0.5">{nickname}님, 오늘도 잘 입어요</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>

        {/* 날씨 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-3">
          {weatherLoading ? (
            <div className="h-28 flex items-center justify-center">
              <p className="text-gray-300 text-sm">날씨 불러오는 중</p>
            </div>
          ) : weather ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mb-1">
                    {locationLabel || weather.city}
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-6xl font-bold text-gray-900 leading-none">{weather.temp}°</p>
                    <p className="text-gray-400 text-sm mb-1">{weather.description}</p>
                  </div>
                </div>
                <span className="text-4xl">{getWeatherEmoji(weather.icon)}</span>
              </div>

              {/* 코디 한마디 */}
              <div className="bg-[#F0F5F0] rounded-xl px-4 py-3 mb-4">
                <p className="text-sm text-[#2C5F2E] font-medium">
                  {getWeatherComment(weather.temp, weather.temp_min, weather.temp_max)}
                </p>
              </div>

              {/* 상세 정보 */}
              <div className="flex gap-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Thermometer size={13} className="text-gray-300" />
                  <div>
                    <p className="text-xs text-gray-400">최고 / 최저</p>
                    <p className="text-xs font-semibold text-gray-700">{weather.temp_max}° / {weather.temp_min}°</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer size={13} className="text-gray-300" />
                  <div>
                    <p className="text-xs text-gray-400">체감</p>
                    <p className="text-xs font-semibold text-gray-700">{weather.feels_like}°</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets size={13} className="text-gray-300" />
                  <div>
                    <p className="text-xs text-gray-400">습도</p>
                    <p className="text-xs font-semibold text-gray-700">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind size={13} className="text-gray-300" />
                  <div>
                    <p className="text-xs text-gray-400">바람</p>
                    <p className="text-xs font-semibold text-gray-700">{weather.wind_speed}m/s</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm text-center py-8">날씨 정보를 가져올 수 없어요</p>
          )}
        </div>

        {/* 코디 추천 버튼 */}
        {needsMore ? (
          <div className="bg-gray-50 rounded-2xl px-5 py-4 mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">코디 추천까지</p>
              <p className="text-sm font-medium text-gray-600">옷 {remaining}벌 더 등록하면 시작돼요</p>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < totalCount ? 'bg-[#2C5F2E]' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push('/outfit')}
            className="w-full py-4 rounded-2xl font-medium text-sm mb-3 bg-[#2C5F2E] text-white hover:bg-[#234d25] transition-colors"
          >
            오늘의 코디 추천 받기
          </button>
        )}

        {/* 내 옷장 섹션 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold text-gray-800">내 옷장</p>
              <p className="text-xs text-gray-400 mt-0.5">총 {totalCount}개의 아이템</p>
            </div>
            <button
              onClick={() => router.push('/closet/list')}
              className="flex items-center gap-0.5 text-sm text-[#2C5F2E] font-medium"
            >
              전체보기
              <ChevronRight size={14} />
            </button>
          </div>

          {totalCount === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-300 text-sm mb-3">등록된 옷이 없어요</p>
              <button
                onClick={() => router.push('/closet')}
                className="inline-flex items-center gap-1.5 text-sm text-[#2C5F2E] font-medium border border-[#2C5F2E] rounded-xl px-4 py-2"
              >
                <Plus size={14} />
                첫 번째 옷 추가하기
              </button>
            </div>
          ) : (
            <div className="flex gap-2.5 mb-4">
              {recentClothes.map((item) => (
                <div key={item.id} className="flex-1">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name || item.category}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-xs text-gray-400">{CATEGORY_LABEL[item.category]}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1.5 truncate">
                    {item.name || item.category}
                  </p>
                </div>
              ))}
              {totalCount > 3 && (
                <button
                  onClick={() => router.push('/closet/list')}
                  className="flex-1 aspect-square rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-1"
                >
                  <p className="text-sm font-semibold text-gray-400">+{totalCount - 3}</p>
                  <p className="text-xs text-gray-300">더보기</p>
                </button>
              )}
            </div>
          )}

          {totalCount > 0 && (
            <button
              onClick={() => router.push('/closet')}
              className="w-full py-2.5 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[#2C5F2E] hover:text-[#2C5F2E] transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              옷 추가하기
            </button>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  )
}