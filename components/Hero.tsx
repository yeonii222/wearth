import EmailForm from './EmailForm'

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f5f0] px-6 py-24 text-center">
      {/* 배경 장식 */}
      <div
        aria-hidden
        className="absolute -top-24 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#4F7B5F]/8 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#4F7B5F]/6 blur-3xl"
      />

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-8">
        {/* 배지 */}
        <span className="inline-flex items-center gap-2 rounded-full border border-[#4F7B5F]/20 bg-white px-4 py-1.5 text-sm font-medium text-[#4F7B5F]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4F7B5F]" />
          얼리액세스 모집 중
        </span>

        {/* 브랜드명 */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-7xl font-bold tracking-tight text-[#4F7B5F] sm:text-8xl">
            WEARTH
          </h1>
          <p className="text-2xl font-light tracking-widest text-[#4F7B5F]/70 sm:text-3xl">
            오늘 날씨, 오늘 코디
          </p>
        </div>

        {/* 설명 */}
        <p className="max-w-lg text-lg leading-relaxed text-gray-600">
          날씨를 알면 스타일이 보입니다.
          <br />
          매일 아침, 당신의 날씨와 취향에 맞는
          <br />
          완벽한 코디를 제안해드려요.
        </p>

        {/* 이메일 폼 */}
        <EmailForm />
      </div>

      {/* 스크롤 유도 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
        <span className="text-xs tracking-widest uppercase">scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-gray-400 to-transparent" />
      </div>
    </section>
  )
}
