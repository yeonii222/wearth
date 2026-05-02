import { NextResponse } from 'next/server'
import { generateOutfitRecommendation } from '@/lib/outfit-engine'
import { createClient } from '@/lib/supabase-server'
import type { Gender, Style, Sensitivity, WeatherCondition } from '@/lib/outfit-engine'

// 아이템 이름 키워드 → 겸용 카테고리 매핑
const CROSS_CATEGORY_KEYWORDS: Record<string, string[]> = {
  // 상의 → 아우터 겸용
  '셔츠': ['top', 'outer'],
  '가디건': ['top', 'outer'],
  '후드집업': ['top', 'outer'],
  '집업': ['top', 'outer'],
  '블레이저': ['top', 'outer'],
  '자켓': ['top', 'outer'],
  '재킷': ['top', 'outer'],
  '점퍼': ['top', 'outer'],
  '바람막이': ['top', 'outer'],
  '후리스': ['top', 'outer'],
  '플리스': ['top', 'outer'],
  // 아우터 → 상의 겸용
  '패딩': ['outer', 'top'],
  '코트': ['outer'],
  '무스탕': ['outer'],
}

// 아이템 이름에서 겸용 카테고리 추출
function getCrossCategories(item: any): string[] {
  const name = (item.name || '').toLowerCase()
  const categoryMap: Record<string, string> = {
    '상의': 'top',
    '하의': 'bottom',
    '아우터': 'outer',
    '신발': 'footwear',
    '액세서리': 'accessories',
  }

  // 기본 카테고리
  const baseCategory = categoryMap[item.category] || item.category
  const categories = new Set<string>([baseCategory])

  // 이름 기반 크로스 매칭
  for (const [keyword, crossCategories] of Object.entries(CROSS_CATEGORY_KEYWORDS)) {
    if (name.includes(keyword)) {
      crossCategories.forEach(cat => categories.add(cat))
    }
  }

  return Array.from(categories)
}

export async function POST(request: Request) {
  const { weather, gender, style, sensitivity } = await request.json()

  if (!weather || !gender || !style || !sensitivity) {
    return NextResponse.json({ error: '필수 정보가 없습니다.' }, { status: 400 })
  }

  // 코디 추천 생성
  const recommendation = generateOutfitRecommendation(
    weather as WeatherCondition,
    gender as Gender,
    style as Style,
    sensitivity as Sensitivity
  )

  // 사용자 옷장 가져오기
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const matchedClothes: Record<string, any[]> = {
    top: [],
    bottom: [],
    outer: [],
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
        // 크로스 카테고리 포함해서 매칭
        const categories = getCrossCategories(item)
        categories.forEach((cat) => {
          if (matchedClothes[cat]) {
            // 중복 방지
            const alreadyAdded = matchedClothes[cat].some(i => i.id === item.id)
            if (!alreadyAdded) {
              matchedClothes[cat].push(item)
            }
          }
        })
      })
    }
  }

  return NextResponse.json({
    ...recommendation,
    matchedClothes,
  })
}