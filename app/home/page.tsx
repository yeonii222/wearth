'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

const CATEGORY_EMOJI: Record<string, string> = {
  '상의': '👕',
  '하의': '👖',
  '아우터': '🧥',
  '신발': '👟',
  '액세서리': '👜',
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
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 프로필 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('location_lat, location_lon, location_address, nickname')
        .eq('id', user.id)
        .single()

      if (profile?.nickname) setNickname(profile.nickname)
      if (profile?.location_address) setLocationLabel(profile.location_address)

      // 옷장 아이템 가져오기
      const { data: clothesData } = await supabase
        .from('clothes')
        .select('id, name, category, color, image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (clothesData) setClothes(clothesData)

      // 날씨 가져오기
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
    router.push('/auth/login')
  }

  const recentClothes = clothes.slice(0, 3)
  const totalCount = clothes.length
  const needsMore = totalCount < 5

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2C5F2E]">WEARTH</h1>
            {nickname && (
              <p className="text-sm text-gray-500 mt-0.5">{nickname}님, 오늘도 잘 입어요 👋</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            로그아웃
          </button>
        </div>

        {/* 날씨 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          {weatherLoading ? (
            <p className="text-gray-400 text-sm text-center">날씨 불러오는 중...</p>
          ) : weather ? (
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">{locationLabel || weather.city}</p>
                  <p className="text-5xl font-bold text-gray-800 mt-1">{weather.temp}°</p>
                  <p className="text-gray-500 text-sm mt-1">{weather.description}</p>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt="날씨 아이콘"
                  className="w-16 h-16"
                />
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-400">최고</p>
                  <p className="text-sm font-medium text-gray-700">{weather.temp_max}°</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">최저</p>
                  <p className="text-sm font-medium text-gray-700">{weather.temp_min}°</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">체감</p>
                  <p className="text-sm font-medium text-gray-700">{weather.feels_like}°</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">습도</p>
                  <p className="text-sm font-medium text-gray-700">{weather.humidity}%</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center">날씨 정보를 가져올 수 없어요</p>
          )}
        </div>

        {/* 코디 추천 버튼 */}
        <button
          onClick={() => router.push('/outfit')}
          disabled={needsMore}
          className={`w-full py-4 rounded-2xl font-medium text-sm mb-4 transition-colors ${
            needsMore
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#2C5F2E] text-white hover:bg-[#234d25]'
          }`}
        >
          {needsMore
            ? `옷을 ${5 - totalCount}벌 더 등록하면 코디 추천을 받을 수 있어요 👗`
            : '오늘의 코디 추천 받기 👗'}
        </button>

        {/* 내 옷장 섹션 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium text-gray-800">내 옷장</p>
              <p className="text-xs text-gray-400 mt-0.5">총 {totalCount}개의 아이템</p>
            </div>
            <button
              onClick={() => router.push('/closet/list')}
              className="text-sm text-[#2C5F2E] font-medium"
            >
              전체보기
            </button>
          </div>

          {/* 5벌 미만 독려 메시지 */}
          {needsMore && (
            <div className="bg-[#F5F0E8] rounded-xl p-3 mb-4 flex items-center gap-2">
              <span className="text-lg">👗</span>
              <p className="text-xs text-[#2C5F2E]">
                옷을 5벌 이상 등록하면 코디 추천이 시작돼요! ({totalCount}/5)
              </p>
            </div>
          )}

          {/* 최근 아이템 미리보기 */}
          {totalCount === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              아직 등록된 옷이 없어요. 옷을 추가해보세요!
            </p>
          ) : (
            <div className="flex gap-3">
              {recentClothes.map((item) => (
                <div key={item.id} className="flex-1">
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F0E8] flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name || item.category}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{CATEGORY_EMOJI[item.category] || '👕'}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1 truncate">
                    {item.name || item.category}
                  </p>
                </div>
              ))}
              {/* 더보기 슬롯 */}
              {totalCount > 3 && (
                <button
                  onClick={() => router.push('/closet/list')}
                  className="flex-1 aspect-square rounded-xl bg-gray-50 flex items-center justify-center"
                >
                  <p className="text-xs text-gray-400 text-center">+{totalCount - 3}개<br/>더보기</p>
                </button>
              )}
            </div>
          )}

          {/* 옷 추가 버튼 */}
          <button
            onClick={() => router.push('/closet')}
            className="w-full mt-4 py-2.5 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[#2C5F2E] hover:text-[#2C5F2E] transition-colors"
          >
            + 옷 추가하기
          </button>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}