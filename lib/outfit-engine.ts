// 기온 구간 정의 (T1~T9)
export type TempCode = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'T8' | 'T9'
export type Gender = 'male' | 'female' | 'none'
export type Style = 'casual' | 'formal' | 'date' | 'sporty'
export type Sensitivity = 'cold' | 'normal' | 'hot'

export interface WeatherCondition {
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  rain?: number
  snow?: number
}

export interface OutfitRecommendation {
  tempCode: TempCode
  top: string[]
  bottom: string[]
  outer: string[]
  footwear: string[]
  accessories: string[]
  weatherWarning?: string
}

// 체감온도 기준 기온 구간 결정
export function getTempCode(feelsLike: number): TempCode {
  if (feelsLike >= 28) return 'T1'
  if (feelsLike >= 23) return 'T2'
  if (feelsLike >= 20) return 'T3'
  if (feelsLike >= 17) return 'T4'
  if (feelsLike >= 12) return 'T5'
  if (feelsLike >= 9) return 'T6'
  if (feelsLike >= 5) return 'T7'
  if (feelsLike >= 0) return 'T8'
  return 'T9'
}

// 체온 민감도 보정
export function applyTempSensitivity(feelsLike: number, sensitivity: Sensitivity): number {
  if (sensitivity === 'cold') return feelsLike - 3
  if (sensitivity === 'hot') return feelsLike + 3
  return feelsLike
}

// 날씨 보정 (비/눈/바람)
export function getWeatherWarning(weather: WeatherCondition): string | undefined {
  if (weather.snow && weather.snow > 0) return '❄️ 눈이 와요! 방수 부츠와 미끄럼 주의 신발을 추천해요.'
  if (weather.rain && weather.rain > 10) return '🌧️ 비가 많이 와요! 레인코트와 방수 신발을 추천해요.'
  if (weather.rain && weather.rain > 4) return '🌂 비가 와요! 우산과 방수 재킷을 챙기세요.'
  if (weather.rain && weather.rain > 0) return '🌦️ 이슬비가 내려요. 바람막이나 캡을 추천해요.'
  if (weather.wind_speed >= 10) return '💨 바람이 매우 강해요! 롱 아우터와 넥워머를 추천해요.'
  if (weather.wind_speed >= 7) return '🌬️ 바람이 강해요. 방풍 아우터를 챙기세요.'
  if (weather.humidity >= 70) return '💧 습도가 높아요. 흡습속건 소재를 추천해요.'
  return undefined
}

// 기온 구간별 아이템 매핑
const outfitMap: Record<TempCode, Record<Style, Record<Gender | 'common', Partial<OutfitRecommendation>>>> = {
  T1: {
    casual: {
      common: { top: ['반팔 티셔츠', '나시', '민소매'], bottom: ['반바지', '숏팬츠'], outer: [], footwear: ['스니커즈', '샌들'], accessories: ['선글라스', '챙 넓은 모자'] },
      female: { top: ['슬리브리스 블라우스', '크롭탑', '오프숄더'], bottom: ['미니스커트', '린넨 원피스'] },
      male: { top: ['쿨링 티셔츠'], bottom: ['버뮤다 팬츠'] },
    },
    formal: {
      common: { top: ['린넨 반팔 셔츠'], bottom: ['린넨 슬랙스'], outer: [], footwear: ['로퍼'], accessories: ['선글라스'] },
      female: { top: ['얇은 블라우스'], bottom: ['미디 스커트'] },
      male: { top: ['피케 티'], bottom: ['치노 팬츠'] },
    },
    date: {
      common: { top: ['린넨 셔츠'], bottom: ['린넨 팬츠'], outer: [], footwear: ['샌들', '로퍼'], accessories: ['선글라스'] },
      female: { top: ['오프숄더'], bottom: ['린넨 원피스'] },
      male: { top: ['반팔 셔츠'], bottom: ['슬랙스'] },
    },
    sporty: {
      common: { top: ['기능성 반팔', '드라이핏 티'], bottom: ['기능성 쇼츠', '트레이닝 쇼츠'], outer: [], footwear: ['러닝화'], accessories: ['캡', '쿨토시'] },
      female: {},
      male: {},
    },
  },
  T2: {
    casual: {
      common: { top: ['반팔 티', '얇은 셔츠'], bottom: ['면바지', '얇은 청바지'], outer: ['얇은 셔츠(겉옷용)'], footwear: ['스니커즈', '캔버스화'], accessories: ['선글라스', '캡'] },
      female: { top: ['블라우스'], bottom: ['미디 스커트', '린넨 와이드팬츠'] },
      male: { top: ['폴로 셔츠'], bottom: ['치노 쇼츠'] },
    },
    formal: {
      common: { top: ['셔츠'], bottom: ['슬랙스'], outer: [], footwear: ['로퍼'], accessories: [] },
      female: { top: ['얇은 블라우스'], bottom: ['미디 스커트'] },
      male: { top: ['피케 티'], bottom: ['치노팬츠'] },
    },
    date: {
      common: { top: ['얇은 셔츠'], bottom: ['면바지'], outer: ['얇은 가디건'], footwear: ['로퍼', '스니커즈'], accessories: ['얇은 스카프'] },
      female: { top: ['블라우스'], bottom: ['미디스커트'] },
      male: { top: ['셔츠'], bottom: ['치노팬츠'] },
    },
    sporty: {
      common: { top: ['드라이핏 티'], bottom: ['트레이닝 쇼츠'], outer: [], footwear: ['러닝화'], accessories: [] },
      female: {},
      male: {},
    },
  },
  T3: {
    casual: {
      common: { top: ['긴팔 티', '후드티', '맨투맨'], bottom: ['면바지', '청바지'], outer: ['얇은 가디건', '셔켓'], footwear: ['스니커즈'], accessories: ['얇은 스카프'] },
      female: { top: ['얇은 블라우스', '7부 니트'], bottom: ['긴 스커트'] },
      male: { top: ['긴팔 폴로'], bottom: ['치노팬츠'] },
    },
    formal: {
      common: { top: ['셔츠'], bottom: ['슬랙스'], outer: ['블레이저'], footwear: ['로퍼'], accessories: [] },
      female: { top: ['얇은 블라우스'], bottom: ['슬랙스'] },
      male: { top: ['셔츠'], bottom: ['슬랙스'] },
    },
    date: {
      common: { top: ['얇은 니트'], bottom: ['슬랙스'], outer: ['트렌치', '가디건'], footwear: ['로퍼', '앵클부츠'], accessories: [] },
      female: { top: ['얇은 니트'], bottom: ['미디스커트'] },
      male: { top: ['셔츠'], bottom: ['치노팬츠'] },
    },
    sporty: {
      common: { top: ['긴팔 드라이핏'], bottom: ['트레이닝 팬츠'], outer: [], footwear: ['러닝화'], accessories: [] },
      female: {},
      male: {},
    },
  },
  T4: {
    casual: {
      common: { top: ['맨투맨', '후드티', '얇은 니트'], bottom: ['청바지', '면바지'], outer: ['가디건', '데님자켓', '바람막이'], footwear: ['스니커즈'], accessories: ['얇은 머플러'] },
      female: { top: ['얇은 터틀넥', '라운드 니트'], bottom: ['스커트+스타킹', '코듀로이 팬츠'] },
      male: { top: ['옥스포드 셔츠'], bottom: ['치노팬츠'] },
    },
    formal: {
      common: { top: ['셔츠'], bottom: ['슬랙스'], outer: ['블레이저'], footwear: ['로퍼', '더비슈즈'], accessories: [] },
      female: { top: ['블라우스'], bottom: ['슬랙스'] },
      male: { top: ['셔츠'], bottom: ['슬랙스'] },
    },
    date: {
      common: { top: ['니트'], bottom: ['슬랙스'], outer: ['트렌치코트'], footwear: ['앵클부츠', '로퍼'], accessories: ['포인트 스카프'] },
      female: { top: ['라운드 니트'], bottom: ['미디스커트'] },
      male: { top: ['니트'], bottom: ['치노팬츠'] },
    },
    sporty: {
      common: { top: ['긴팔'], bottom: ['조거팬츠'], outer: ['바람막이'], footwear: ['러닝화'], accessories: [] },
      female: {},
      male: {},
    },
  },
  T5: {
    casual: {
      common: { top: ['니트', '맨투맨', '기모 맨투맨'], bottom: ['청바지', '슬랙스'], outer: ['야상', '트렌치', '블레이저'], footwear: ['스니커즈', '첼시부츠'], accessories: ['머플러', '니트 비니'] },
      female: { top: ['울 블렌드 니트', '얇은 터틀넥'], bottom: ['스커트+두꺼운 스타킹'] },
      male: { top: ['플란넬 셔츠'], bottom: ['울 혼방 슬랙스'] },
    },
    formal: {
      common: { top: ['셔츠', '니트'], bottom: ['슬랙스'], outer: ['블레이저', '트렌치코트'], footwear: ['로퍼', '더비슈즈'], accessories: [] },
      female: { top: ['블라우스'], bottom: ['슬랙스'] },
      male: { top: ['셔츠'], bottom: ['슬랙스'] },
    },
    date: {
      common: { top: ['니트'], bottom: ['슬랙스'], outer: ['트렌치코트', '체스터코트'], footwear: ['앵클부츠'], accessories: ['머플러'] },
      female: { top: ['니트'], bottom: ['롱스커트'] },
      male: { top: ['니트'], bottom: ['치노팬츠'] },
    },
    sporty: {
      common: { top: ['긴팔'], bottom: ['조거팬츠'], outer: ['경량 패딩조끼'], footwear: ['러닝화'], accessories: [] },
      female: {},
      male: {},
    },
  },
  T6: {
    casual: {
      common: { top: ['두꺼운 니트', '터틀넥', '기모 맨투맨'], bottom: ['기모 청바지', '코듀로이'], outer: ['트렌치코트', '숏 패딩', '무스탕'], footwear: ['앵클부츠', '워커'], accessories: ['머플러', '니트 비니', '얇은 장갑'] },
      female: { top: ['울 터틀넥', '니트 원피스'], bottom: ['기모 스타킹+스커트'] },
      male: { top: ['울 셔츠'], bottom: ['기모 치노'] },
    },
    formal: {
      common: { top: ['셔츠', '울 니트'], bottom: ['슬랙스'], outer: ['체스터코트'], footwear: ['더비슈즈', '워커'], accessories: ['머플러'] },
      female: { top: ['블라우스+니트'], bottom: ['슬랙스'] },
      male: { top: ['셔츠+니트'], bottom: ['울 슬랙스'] },
    },
    date: {
      common: { top: ['니트'], bottom: ['슬랙스'], outer: ['롱코트'], footwear: ['부츠'], accessories: ['머플러'] },
      female: { top: ['니트 원피스'], bottom: ['롱코트+롱부츠'] },
      male: { top: ['니트'], bottom: ['슬랙스'] },
    },
    sporty: {
      common: { top: ['기모 긴팔'], bottom: ['기모 조거'], outer: ['경량 다운조끼'], footwear: ['러닝화'], accessories: [] },
      female: {},
      male: {},
    },
  },
  T7: {
    casual: {
      common: { top: ['두꺼운 니트', '울 터틀넥', '기모 맨투맨', '히트텍'], bottom: ['기모 청바지', '기모 슬랙스'], outer: ['울코트', '숏 패딩', '경량 다운'], footwear: ['첼시부츠', '워커'], accessories: ['두꺼운 머플러', '니트 비니', '장갑'] },
      female: { top: ['앙고라 니트'], bottom: ['두꺼운 스타킹+스커트'] },
      male: { top: ['두꺼운 플란넬'], bottom: ['울 슬랙스'] },
    },
    formal: {
      common: { top: ['히트텍+셔츠+니트'], bottom: ['슬랙스'], outer: ['울 코트'], footwear: ['더비슈즈', '부츠'], accessories: ['머플러'] },
      female: { top: ['캐시미어 니트'], bottom: ['슬랙스'] },
      male: { top: ['셔츠+니트'], bottom: ['울 슬랙스'] },
    },
    date: {
      common: { top: ['앙고라 니트'], bottom: ['슬랙스'], outer: ['롱코트'], footwear: ['부츠'], accessories: ['두꺼운 머플러'] },
      female: { top: ['앙고라 니트'], bottom: ['롱코트+롱부츠'] },
      male: { top: ['니트'], bottom: ['슬랙스'] },
    },
    sporty: {
      common: { top: ['기모 긴팔'], bottom: ['기모 조거'], outer: ['방풍 자켓'], footwear: ['러닝화'], accessories: [] },
      female: {},
      male: {},
    },
  },
  T8: {
    casual: {
      common: { top: ['히트텍', '두꺼운 니트', '플리스', '터틀넥'], bottom: ['기모 바지', '울 슬랙스'], outer: ['롱 패딩', '헤비 다운', '두꺼운 울코트'], footwear: ['털 안감 부츠', '방한화'], accessories: ['두꺼운 머플러', '털 모자', '장갑', '이어머프'] },
      female: { top: ['캐시미어 니트'], bottom: ['기모 타이츠+스커트'] },
      male: { top: ['라운드넥 울 스웨터'], bottom: ['기모 청바지'] },
    },
    formal: {
      common: { top: ['발열내의+셔츠+두꺼운 니트'], bottom: ['울 슬랙스'], outer: ['헤비 코트'], footwear: ['방한 구두'], accessories: ['머플러'] },
      female: { top: ['캐시미어 니트'], bottom: ['슬랙스'] },
      male: { top: ['셔츠+베스트+니트'], bottom: ['울 슬랙스'] },
    },
    date: {
      common: { top: ['니트'], bottom: ['슬랙스'], outer: ['롱 코트'], footwear: ['롱부츠'], accessories: ['두꺼운 머플러'] },
      female: { top: ['니트 원피스'], bottom: ['롱 코트+롱부츠'] },
      male: { top: ['니트'], bottom: ['울 슬랙스'] },
    },
    sporty: {
      common: { top: ['발열내의+윈드브레이커'], bottom: ['기모 조거'], outer: [], footwear: ['방한 러닝화'], accessories: [] },
      female: {},
      male: {},
    },
  },
  T9: {
    casual: {
      common: { top: ['히트텍 엑스트라 웜', '기모 터틀넥', '두꺼운 울 니트'], bottom: ['기모 바지', '방한 팬츠'], outer: ['헤비 구스다운 롱패딩', '방한 파카'], footwear: ['방한화', '스노우 부츠'], accessories: ['기모 머플러', '털 모자', '방한 장갑', '핫팩', '넥워머'] },
      female: { top: ['캐시미어 폴라'], bottom: ['기모 타이츠 2겹'] },
      male: { top: ['발열내의+두꺼운 울'], bottom: ['방풍 팬츠'] },
    },
    formal: {
      common: { top: ['발열내의+셔츠+조끼'], bottom: ['두꺼운 울 슬랙스'], outer: ['헤비 울코트'], footwear: ['방한 구두'], accessories: ['머플러', '장갑'] },
      female: { top: ['캐시미어 니트'], bottom: ['슬랙스'] },
      male: { top: ['셔츠+조끼+니트'], bottom: ['울 슬랙스'] },
    },
    date: {
      common: { top: ['기모 니트'], bottom: ['슬랙스'], outer: ['롱패딩'], footwear: ['퍼 부츠'], accessories: ['두꺼운 머플러', '장갑'] },
      female: { top: ['기모 원피스+히트텍'], bottom: ['롱패딩+퍼 부츠'] },
      male: { top: ['니트'], bottom: ['울 슬랙스'] },
    },
    sporty: {
      common: { top: ['베이스레이어(메리노울)+미드레이어(플리스)'], bottom: ['기모 조거'], outer: ['고어텍스 쉘'], footwear: ['방한 트레킹화'], accessories: ['방풍 비니', '고글'] },
      female: {},
      male: {},
    },
  },
}

// 최종 추천 생성
export function generateOutfitRecommendation(
  weather: WeatherCondition,
  gender: Gender,
  style: Style,
  sensitivity: Sensitivity
): OutfitRecommendation {
  const adjustedTemp = applyTempSensitivity(weather.feels_like, sensitivity)
  const tempCode = getTempCode(adjustedTemp)
  const weatherWarning = getWeatherWarning(weather)

  const styleMap = outfitMap[tempCode][style]
  const common = styleMap.common || {}
  const genderSpecific = gender !== 'none' ? (styleMap[gender] || {}) : {}

  const merge = (key: keyof OutfitRecommendation) => {
    const base = (common[key] as string[]) || []
    const extra = (genderSpecific[key] as string[]) || []
    return [...base, ...extra]
  }

  return {
    tempCode,
    top: merge('top'),
    bottom: merge('bottom'),
    outer: merge('outer'),
    footwear: merge('footwear'),
    accessories: merge('accessories'),
    weatherWarning,
  }
}