import type { ReactNode } from 'react'

const problems: { emoji: string; title: ReactNode; key: string; description: string }[] = [
  {
    emoji: '🌧️',
    key: 'weather',
    title: <>오늘도 얇게 입고 나왔다. (아잇 추워)</>,
    description: '날씨를 알아도 옷 선택은 늘 어렵죠. 오늘 기온에 딱 맞는 옷, 사실 이미 옷장에 있어요.',
  },
  {
    emoji: '⏰',
    key: 'morning',
    title: <>바쁜 아침 스트레스<br />&apos;오늘 뭐 입지?&apos;</>,
    description: '잠도 더 자고 싶고, 아침도 먹고 싶은 당신. 소중한 아침 시간을 되찾아 드릴게요.',
  },
  {
    emoji: '🤷',
    key: 'closet',
    title: <>옷장은 터질 것 같은데<br />왜 입을 옷이 없을까?</>,
    description: '가지고 있는 옷을 100% 활용해 날씨에 딱 맞는 최적의 조합을 찾아드릴게요.',
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
            하루 15분, 매일 옷장 앞에서 사라지고 있어요.
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
            매일 반복되는 고민, <strong className="text-[#4F7B5F]">WEARTH</strong>가 해결해드립니다.
            <br />
            날씨를 이해하고, 당신을 이해하는 AI가 당신의 아침을 더 여유롭게 만들어드릴게요.
          </p>
        </div>
      </div>
    </section>
  )
}
