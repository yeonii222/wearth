import { NextResponse } from 'next/server'
import { generateOutfitRecommendation, getAcceptableLengths, getTempCode, applyTempSensitivity } from '@/lib/outfit-engine'
import { createClient } from '@/lib/supabase-server'
import type { Gender, Style, Sensitivity, WeatherCondition } from '@/lib/outfit-engine'

// 상의 세부 종류 중 "아우터 성격"을 가진 것들
const OUTER_SUB_CATEGORIES = ['자켓', '코트', '패딩/점퍼', '조끼', '가디건']

export async function POST(request: Request) {
  const { weather, gender, style, sensitivity } = await request.json()

  if (!weather || !gender || !style || !sensitivity) {
    return NextResponse.json({ error: '필수 정보가 없습니다.' }, { status: 400 })
  }

  const recommendation = generateOutfitRecommendation(
    weather as WeatherCondition,
    gender as Gender,
    style as Style,
    sensitivity as Sensitivity
  )

  const adjustedTemp = applyTempSensitivity(weather.feels_like, sensitivity as Sensitivity)
  const tempCode = getTempCode(adjustedTemp)
  const acceptableTopLengths = getAcceptableLengths(tempCode, 'top')
  const acceptableBottomLengths = getAcceptableLengths(tempCode, 'bottom')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const matchedClothes: Record<string, any[]> = {
    top: [],
    bottom: [],
    footwear: [],
    accessories: [],
  }

  if (user) {
    const { data: clothes } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_id', user.id)

    if (clothes) {
      clothes.forEach((item) => {
        const categoryMap: Record<string, string> = {
          '상의': 'top',
          '하의': 'bottom',
          '신발': 'footwear',
          '액세서리': 'accessories',
        }
        const key = categoryMap[item.category]
        if (!key || !matchedClothes[key]) return

        // 상의/하의는 온도 적합 기장만 통과 (B안: 온도 필터링)
        if (key === 'top' && item.length && !acceptableTopLengths.includes(item.length)) return
        if (key === 'bottom' && item.length && !acceptableBottomLengths.includes(item.length)) return

        matchedClothes[key].push(item)
      })
    }
  }

  return NextResponse.json({
    ...recommendation,
    matchedClothes,
    outerSubCategories: OUTER_SUB_CATEGORIES,
  })
}