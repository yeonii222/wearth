'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'

interface ClothingItem {
  id: string
  name: string | null
  category: string
  color: string | null
  material: string | null
  image_url: string | null
  input_type: string
  created_at: string
}

const CATEGORY_EMOJI: Record<string, string> = {
  '상의': '👕',
  '하의': '👖',
  '아우터': '🧥',
  '신발': '👟',
  '액세서리': '👜',
}

export default function ClosetListPage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('전체')
  const router = useRouter()
  const supabase = createClient()

  const FILTERS = ['전체', '상의', '하의', '아우터', '신발', '액세서리']

  useEffect(() => {
    const fetchItems = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) setItems(data)
      setLoading(false)
    }

    fetchItems()
  }, [])

  const filtered = filter === '전체' ? items : items.filter(i => i.category === filter)

  const handleDelete = async (id: string) => {
    if (!confirm('이 아이템을 삭제할까요?')) return
    await supabase.from('clothes').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">내 옷장</h1>
          <button
            onClick={() => router.push('/closet')}
            className="bg-[#2C5F2E] text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            + 추가
          </button>
        </div>

        {/* 아이템 수 */}
        <p className="text-sm text-gray-500 mb-4">총 {items.length}개의 아이템</p>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                filter === f
                  ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
        )}

        {/* 빈 상태 */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👗</p>
            <p className="text-gray-500 text-sm">등록된 옷이 없어요</p>
            <button
              onClick={() => router.push('/closet')}
              className="mt-4 bg-[#2C5F2E] text-white px-6 py-2 rounded-xl text-sm font-medium"
            >
              옷 추가하기
            </button>
          </div>
        )}

        {/* 아이템 목록 */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">

              {/* 이미지 또는 이모지 */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#F5F0E8] flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{CATEGORY_EMOJI[item.category] || '👕'}</span>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">
                  {item.name || item.category}
                </p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-[#F5F0E8] text-[#2C5F2E] px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  {item.color && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {item.color}
                    </span>
                  )}
                  {item.material && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {item.material}
                    </span>
                  )}
                </div>
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDelete(item.id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-lg flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>

      </div>

      <BottomNav />
    </div>
  )
}