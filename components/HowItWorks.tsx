const steps = [
  {
    number: '01',
    icon: '🌤️',
    title: '오늘의 날씨를 파악해요',
    description:
      '위치 기반으로 기온, 강수 확률, 체감 온도까지 실시간으로 분석합니다. 날씨를 제대로 아는 것이 시작이에요.',
  },
  {
    number: '02',
    icon: '✨',
    title: 'AI가 코디를 제안해드려요',
    description:
      '날씨 데이터와 당신의 취향을 결합해 오늘 가장 어울리는 코디를 골라드립니다. 내 옷장 기반으로요.',
  },
  {
    number: '03',
    icon: '🚀',
    title: '자신감 있게 하루를 시작해요',
    description:
      '더 이상 고민하지 않아도 됩니다. 완성된 코디로 하루를 시작하면, 아침부터 기분이 달라질 거예요.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-[#f7f5f0] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#4F7B5F]">
            작동 방식
          </p>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            3단계로 완성되는
            <br />
            나만의 스타일
          </h2>
        </div>

        {/* 스텝 */}
        <div className="relative flex flex-col gap-0">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex gap-6 sm:gap-10">
              {/* 왼쪽: 번호 + 연결선 */}
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#4F7B5F] text-lg text-white shadow-md">
                  {step.icon}
                </div>
                {idx < steps.length - 1 && (
                  <div className="my-2 h-16 w-px bg-gradient-to-b from-[#4F7B5F]/40 to-transparent" />
                )}
              </div>

              {/* 오른쪽: 콘텐츠 */}
              <div className={`pb-${idx < steps.length - 1 ? '10' : '0'} pt-3`}>
                <span className="text-xs font-bold tracking-widest text-[#4F7B5F]/50">
                  STEP {step.number}
                </span>
                <h3 className="mt-1 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
