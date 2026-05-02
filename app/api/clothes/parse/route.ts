import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { description } = await req.json()

  if (!description) {
    return NextResponse.json({ error: '설명이 없습니다.' }, { status: 400 })
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `다음 옷 설명을 분석해서 JSON으로만 응답해줘. 다른 텍스트는 절대 포함하지 마.

옷 설명: "${description}"

응답 형식:
{
  "name": "옷 이름 (예: 피셔맨 니트)",
  "category": "상의 | 하의 | 아우터 | 신발 | 액세서리 중 하나",
  "color": "색상 (예: 연핑크)",
  "material": "소재 (예: 알파카 울)"
}`,
        },
      ],
    }),
  })

  const data = await response.json()

  try {
    const text = data.content[0].text.trim()
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: '파싱 실패' }, { status: 500 })
  }
}