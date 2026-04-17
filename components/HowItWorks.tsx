const steps = [
  {
    number: '01',
    icon: '🌤️',
    title: '오늘 날씨, 제가 먼저 확인할게요.',
    description:
      '기온이 몇 도인지, 비가 올지, 체감은 어떤지. 앱을 여는 순간 바로 보여요. 날씨를 아는 것이 스타일의 시작.',
  },
  {
    number: '02',
    icon: '✨',
    title: '당신의 옷장에서 찾아드려요.',
    description:
      '새 옷 사지마세요. 이미 가진 옷으로 오늘 날씨와 상황에 가장 잘 맞는 코디를 골라드려요.',
  },
  {
    number: '03',
    icon: '🚀',
    title: '3초면 충분해요.',
    description:
      '날씨 확인하고, 옷장 열고, 고민하던 시간. 이제 WEARTH에게 맡기세요. 3초 안에 오늘 뭐 입을지 알려드릴게요.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-[#f7f5f0] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#4F7B5F]">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            오늘 날씨에 딱 맞는 코디를 3초 안에
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
