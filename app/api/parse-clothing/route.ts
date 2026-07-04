import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const CATEGORIES = ['상의', '하의', '아우터', '신발', '액세서리']
const COLORS = ['화이트', '블랙', '그레이', '네이비', '블루', '그린', '레드', '핑크', '베이지', '브라운', '옐로우', '퍼플']
const MATERIALS = ['면', '울', '니트', '린넨', '폴리에스터', '데님', '가죽', '시폰', '벨벳', '기타']

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: '텍스트가 없어요' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `당신은 옷을 분류하는 전문가입니다. 사용자의 자연스러운 옷 설명을 분석해서 카테고리, 색상, 소재를 추출해주세요.
  
          옷 설명: "${text}"

분류 기준:
- 카테고리: 상의(티셔츠/니트/셔츠/블라우스/민소매/탑 등), 하의(바지/청바지/치마/반바지 등), 아우터(코트/자켓/점퍼/가디건 등), 신발(운동화/구두/샌들/부츠 등), 액세서리(가방/모자/벨트/스카프 등)
- 색상: 화이트(하얀/흰), 블랙(검은/검정/까만), 그레이(회색/회/灰), 네이비(남색/진파랑), 블루(파란/파랑), 그린(초록/녹색), 레드(빨간/빨강/붉은), 핑크(분홍/핑크), 베이지(베이지/크림), 브라운(갈색/브라운/카키), 옐로우(노란/노랑), 퍼플(보라/자주)
- 소재: 면(cotton/코튼), 울(울/양모/wool), 니트(니트/뜨개), 린넨(린넨/마), 폴리에스터(폴리/합성), 데님(청/진/denim), 가죽(가죽/leather), 시폰(시폰/chiffon), 벨벳(벨벳/velvet), 기타

규칙:
- 정확히 명시되지 않아도 문맥으로 추론 가능하면 추론할 것 (예: 민소매 → 상의, 청바지 → 하의+데님, 검은색 → 블랙)
- 해당 정보가 없거나 추론 불가능하면 빈 문자열
- 반드시 JSON만 출력. 다른 텍스트 절대 금지.

{"category":"","color":"","material":""}`,
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
console.log('Claude 응답:', rawText)
const responseText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const parsed = JSON.parse(responseText)
      return NextResponse.json({
        category: CATEGORIES.includes(parsed.category) ? parsed.category : '',
        color: COLORS.includes(parsed.color) ? parsed.color : '',
        material: MATERIALS.includes(parsed.material) ? parsed.material : '',
      })
    } catch {
      console.error('JSON 파싱 실패:', responseText)
      return NextResponse.json({ category: '', color: '', material: '' })
    }
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({ error: '파싱 실패' }, { status: 500 })
  }
}