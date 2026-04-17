export default function FounderStory() {
  return (
    <section className="bg-[#4F7B5F] px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:gap-16">
          {/* 아바타 */}
          <div className="flex shrink-0 flex-col items-center gap-3 sm:items-start">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-5xl">
              🌿
            </div>
            <div>
              <p className="font-semibold">김지연</p>
              <p className="text-sm text-white/70">WEARTH 창업자</p>
            </div>
          </div>

          {/* 스토리 */}
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
              창업자 이야기
            </p>

            <blockquote className="space-y-4 text-lg leading-relaxed text-white/90">
              <p>
                "저는 매일 아침 10분씩 옷 고르느라 허비했어요. 날씨도 확인하고,
                코디도 생각하고, 결국엔 어제랑 비슷한 옷을 입고 나가는 나 자신을 보며
                이런 생각이 들었습니다.
              </p>
              <p>
                <em>'날씨를 제대로 이해하면, 옷 고르는 일이 훨씬 쉬워질 텐데.'</em>
              </p>
              <p>
                단순히 날씨 앱과 옷장 사이의 간극을 메우고 싶었어요. 그리고
                거기서 WEARTH가 시작됐습니다. 오늘 날씨에 맞는, 나다운 스타일로
                하루를 시작하는 것. 그 작은 차이가 하루 전체를 바꾼다고 믿어요."
              </p>
            </blockquote>

            {/* 수치 */}
            <div className="mt-4 flex gap-8 border-t border-white/20 pt-6">
              <div>
                <p className="text-3xl font-bold">6개월</p>
                <p className="mt-1 text-sm text-white/60">개발 기간</p>
              </div>
              <div>
                <p className="text-3xl font-bold">1,200+</p>
                <p className="mt-1 text-sm text-white/60">얼리 신청자</p>
              </div>
              <div>
                <p className="text-3xl font-bold">4.9★</p>
                <p className="mt-1 text-sm text-white/60">베타 만족도</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
