const features = [
  {
    icon: '🌡️',
    title: '날씨 기반 코디 추천',
    description:
      '현재 기온과 일교차를 자동으로 읽어 오늘 날씨에 딱 맞는 옷차림을 즉시 제안합니다.',
    highlights: ['현재 기온 자동 감지', '일교차 반영', '즉시 추천'],
  },
  {
    icon: '👚',
    title: '내 옷장 기반 추천',
    description:
      '새 옷을 살 필요 없어요. 이미 가진 옷으로 바로 입을 수 있는 코디를 구성해드립니다.',
    highlights: ['보유 의류 등록', '바로 입을 수 있는 조합', '활용도 극대화'],
  },
  {
    icon: '🎯',
    title: '외출 목적별 맞춤',
    description:
      '출근, 일상, 운동, 약속. 상황에 맞는 코디를 골라주는 스마트 추천으로 매 순간 딱 맞는 스타일을.',
    highlights: ['출근·일상·운동·약속', '목적별 스타일 분류', '스마트 추천'],
  },
]

export default function Features() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* 헤더 */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#4F7B5F]">
            핵심 기능
          </p>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            WEARTH만의 특별함
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-500">
            "오늘 뭐 입지?"를 3초 안에 해결합니다.
          </p>
        </div>

        {/* 기능 카드 */}
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col rounded-3xl border border-gray-100 bg-[#f7f5f0] p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F7B5F]/10 text-3xl">
                {feature.icon}
              </span>
              <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
              <ul className="flex flex-col gap-2">
                {feature.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-[#4F7B5F]">
                    <span className="h-1 w-4 rounded-full bg-[#4F7B5F]" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
