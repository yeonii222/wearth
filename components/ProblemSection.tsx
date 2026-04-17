import type { ReactNode } from 'react'

const problems: { emoji: string; title: ReactNode; key: string; description: string }[] = [
  {
    emoji: '🌧️',
    key: 'weather',
    title: <>일기예보 확인도 했는데<br />여전히 어려운 옷고르기</>,
    description: '얇게 입고 나갔다가 저녁에 덜덜 떨거나, 두꺼운 코트에 땀을 뻘뻘 흘린 적 있으시죠?',
  },
  {
    emoji: '⏰',
    key: 'morning',
    title: <>바쁜 아침 스트레스 10분,<br />'오늘 뭐 입지?'</>,
    description: '허둥지둥 옷을 고르느라 빼앗긴 당신의 소중한 아침 시간을 되찾아 드릴게요.',
  },
  {
    emoji: '👗',
    key: 'closet',
    title: <>옷장은 꽉 찼는데..<br />왜 입을 옷은 없을까요?</>,
    description: '가지고 있는 옷을 100% 활용해 날씨에 딱 맞는 최적의 조합을 찾아드려요.',
  },
]

export default function ProblemSection() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#4F7B5F]">
            IDEAL FOR
          </p>
          <h2 className="text-3xl font-bold leading-snug text-gray-900 sm:text-4xl">
            매일 아침, 같은 고민을
            <br />
            반복하고 있지는 않으신가요?
          </h2>
        </div>

        {/* 문제 카드 */}
        <div className="grid gap-6 sm:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.key}
              className="group rounded-2xl border border-[#4F7B5F]/10 bg-[#f7f5f0] p-6 transition-shadow hover:shadow-md"
            >
              <span className="mb-4 inline-block text-4xl">{p.emoji}</span>
              <h3 className="mb-2 font-semibold text-gray-900">{p.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{p.description}</p>
            </div>
          ))}
        </div>

        {/* 전환 문구 */}
        <div className="mt-16 rounded-2xl bg-[#4F7B5F]/6 px-8 py-8 text-center">
          <p className="text-lg leading-relaxed text-gray-700">
            이 고민들, <strong className="text-[#4F7B5F]">WEARTH</strong>가 해결해드립니다.
            <br />
            날씨를 이해하는 AI가 당신의 아침을 더 여유롭게 만들어드릴게요.
          </p>
        </div>
      </div>
    </section>
  )
}
