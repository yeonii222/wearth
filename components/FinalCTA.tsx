import EmailForm from './EmailForm'

export default function FinalCTA() {
  return (
    <section className="bg-[#f7f5f0] px-6 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        {/* 장식 */}
        <span className="inline-flex items-center justify-center rounded-full bg-[#4F7B5F]/10 p-5 text-5xl">
          🌿
        </span>

        {/* 헤드라인 */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            오늘 날씨에 맞는 코디,
            <br />
            내일부터 시작해보세요
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            얼리액세스에 참여하고, 가장 먼저 WEARTH를 경험해보세요.
            <br />
            한정된 인원에게만 제공되는 무료 베타 서비스입니다.
          </p>
        </div>

        {/* 이메일 폼 */}
        <EmailForm buttonText="무료로 시작하기" />

        {/* 안심 문구 */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="text-[#4F7B5F]">✓</span> 신용카드 불필요
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#4F7B5F]">✓</span> 스팸 없음
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#4F7B5F]">✓</span> 언제든 구독 취소 가능
          </span>
        </div>
      </div>
    </section>
  )
}
