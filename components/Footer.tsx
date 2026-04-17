export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* 브랜드 */}
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold text-[#4F7B5F]">WEARTH</p>
            <p className="text-sm text-gray-400">오늘 날씨, 오늘 코디</p>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-400">
              날씨와 패션을 연결해 매일 아침을 더 여유롭고 스타일리시하게 만들어드립니다.
            </p>
          </div>

          {/* 링크 */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">서비스</p>
              <ul className="flex flex-col gap-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#4F7B5F] transition-colors">기능 소개</a></li>
                <li><a href="#" className="hover:text-[#4F7B5F] transition-colors">요금제</a></li>
                <li><a href="#" className="hover:text-[#4F7B5F] transition-colors">얼리액세스</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">법적고지</p>
              <ul className="flex flex-col gap-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#4F7B5F] transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-[#4F7B5F] transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-[#4F7B5F] transition-colors">문의</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="mt-10 flex flex-col gap-2 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">© {year} WEARTH. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-[#4F7B5F] transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-[#4F7B5F] transition-colors">이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
