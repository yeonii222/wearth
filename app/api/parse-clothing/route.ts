import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const CATEGORIES = ['상의', '하의', '신발', '액세서리']
const COLORS = ['화이트', '블랙', '그레이', '네이비', '블루', '그린', '레드', '핑크', '베이지', '브라운', '옐로우', '퍼플']
const TOP_LENGTHS = ['긴팔', '반팔', '민소매']
const BOTTOM_LENGTHS = ['롱', '숏', '스커트']
const ALL_LENGTHS = [...TOP_LENGTHS, ...BOTTOM_LENGTHS]

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
          content: `당신은 옷을 분류하는 전문가입니다. 사용자의 자연스러운 옷 설명을 분석해서 카테고리, 색상, 기장을 추출해주세요.
  
          옷 설명: "${text}"

분류 기준:
- 카테고리(category): 반드시 "상의", "하의", "신발", "액세서리" 이 4개 단어 중 하나만 그대로 반환할 것. 절대 세부 옷 이름(예: 자켓, 니트, 청바지, 스니커즈 같은 구체적 명칭)을 반환하면 안 됨.
  - "상의"로 분류되는 예: 티셔츠, 니트, 셔츠, 블라우스, 민소매, 탑, 자켓, 가디건, 코트, 패딩, 후드티, 맨투맨 등 상체에 입는 모든 옷
  - "하의"로 분류되는 예: 바지, 청바지, 치마, 반바지, 슬랙스 등 하체에 입는 모든 옷
  - "신발"로 분류되는 예: 운동화, 구두, 샌들, 부츠 등
  - "액세서리"로 분류되는 예: 가방, 모자, 벨트, 스카프 등
- 색상: 화이트(하얀/흰), 블랙(검은/검정/까만), 그레이(회색/회/灰), 네이비(남색/진파랑), 블루(파란/파랑), 그린(초록/녹색), 레드(빨간/빨강/붉은), 핑크(분홍/핑크), 베이지(베이지/크림), 브라운(갈색/브라운/카키), 옐로우(노란/노랑), 퍼플(보라/자주). 이 12가지 중 하나로 명확히 매핑되면 그 이름을 쓰고, 어느 것에도 해당하지 않는 색(예: 민트, 와인색, 스카이블루 등)이면 사용자가 말한 색 표현을 그대로 짧게 반환할 것 (예: "민트색")
- 기장(length): 카테고리가 상의면 긴팔/반팔/민소매 중 하나, 카테고리가 하의면 롱/숏/스커트 중 하나. 명확히 언급 안 됐어도 문맥으로 추론 가능하면 추론할 것(예: "니트" → 보통 긴팔, "반바지" → 숏, "치마"/"스커트" → 스커트). 신발/액세서리는 빈 문자열.

규칙:
- 정확히 명시되지 않아도 문맥으로 추론 가능하면 추론할 것 (예: 민소매 → 상의, 청바지 → 하의, 검은색 → 블랙)
- 해당 정보가 없거나 추론 불가능하면 빈 문자열
- 반드시 JSON만 출력. 다른 텍스트 절대 금지.

{"category":"","color":"","length":""}`,
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    const responseText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const parsed = JSON.parse(responseText)
      const trimmedCategory = typeof parsed.category === 'string' ? parsed.category.trim() : ''
      console.log('Claude 원본 category 값:', JSON.stringify(parsed.category))
      return NextResponse.json({
        category: CATEGORIES.includes(trimmedCategory) ? trimmedCategory : '',
        // 색상은 팔레트에 없어도 원문 그대로 전달 (프론트에서 "기타"로 처리)
        color: typeof parsed.color === 'string' ? parsed.color.trim() : '',
        length: ALL_LENGTHS.includes(parsed.length) ? parsed.length : '',
      })
    } catch {
      return NextResponse.json({ category: '', color: '', length: '' })
    }
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({ error: '파싱 실패' }, { status: 500 })
  }
}