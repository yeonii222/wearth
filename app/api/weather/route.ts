import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: '위치 정보가 필요합니다.' }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`

  const res = await fetch(url)
  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: '날씨 데이터를 가져올 수 없습니다.' }, { status: 500 })
  }

    // 강수량 (mm/h 기준, 지난 1시간). 비/눈이 없으면 필드 자체가 없어서 0으로 처리
  const rain = data.rain?.['1h'] ?? 0
  const snow = data.snow?.['1h'] ?? 0

  return NextResponse.json({
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    temp_min: Math.round(data.main.temp_min),
    temp_max: Math.round(data.main.temp_max),
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    city: data.name,
    rain,
    snow,
  })
}