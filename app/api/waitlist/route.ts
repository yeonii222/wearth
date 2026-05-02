import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('waitlist')
    .insert({ email })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 등록된 이메일이에요.' }, { status: 409 })
    }
    return NextResponse.json({ error: '저장 중 오류가 발생했어요. 다시 시도해주세요.' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
