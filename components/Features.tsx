const features = [
  {
    number: '01',
    title: '나만의 옷장 간편 등록',
    description:
      '사진 한 장이면 충분해요. AI가 카테고리와 색상을 자동으로 인식해 내 옷장을 채워드려요.',
  },
  {
    number: '02',
    title: '날씨 기반 코디 추천',
    description:
      '오늘 기온과 일교차를 자동으로 읽어 내 옷장에서 딱 맞는 조합을 즉시 찾아드려요.',
  },
  {
    number: '03',
    title: '외출 목적별 맞춤 추천',
    description:
      '출근, 일상, 운동, 약속. 상황에 맞는 코디를 골라주는 스마트 추천으로 매 순간 딱 맞는 스타일을 찾아드려요.',
  },
]

export default function Features() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* 헤더 */}
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#4F7B5F]">
            FEATURES
          </p>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            더 이상 고민하지 마세요.
            <br />
            <span className="text-[#4F7B5F]">WEARTH</span>가 대신할게요.
          </h2>
        </div>

        {/* 기능 섹션 */}
        <div className="flex flex-col">
          {features.map((feature, index) => {
            const isEven = index % 2 === 1
            return (
              <div key={feature.number}>
                <div
                  className={`flex flex-col items-center gap-12 py-16 sm:flex-row sm:gap-20 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* 텍스트 */}
                  <div className="flex flex-1 flex-col">
                    <span className="mb-4 text-6xl font-bold text-[#4F7B5F]">
                      {feature.number}
                    </span>
                    <h3 className="mb-4 text-2xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-base leading-relaxed text-gray-500">
                      {feature.description}
                    </p>
                  </div>

                  {/* 이미지 영역 */}
                  <div className="flex flex-1 items-center justify-center">
                    <div className="flex h-72 w-full max-w-sm items-center justify-center rounded-3xl bg-[#E8F2EC]">
                      <span className="text-sm text-[#4F7B5F]/60">앱 화면 준비 중</span>
                    </div>
                  </div>
                </div>

                {/* 구분선 (마지막 섹션 제외) */}
                {index < features.length - 1 && (
                  <hr className="border-gray-100" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
