'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, X, Shirt } from 'lucide-react'
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

const FILTERS = ['전체', '상의', '하의', '아우터', '신발', '액세서리']

export default function ClosetListPage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('전체')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchItems = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

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
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">내 옷장</h1>
          <button
            onClick={() => router.push('/closet')}
            className="bg-[#2C5F2E] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5"
          >
            <Plus size={14} />
            추가
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-5">총 {items.length}개의 아이템</p>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border font-medium transition-colors ${
                filter === f
                  ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12 text-gray-300 text-sm">불러오는 중...</div>
        )}

        {/* 빈 상태 */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Shirt size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm mb-4">등록된 옷이 없어요</p>
            <button
              onClick={() => router.push('/closet')}
              className="bg-[#2C5F2E] text-white px-6 py-2.5 rounded-xl text-sm font-medium"
            >
              옷 추가하기
            </button>
          </div>
        )}

        {/* 아이템 목록 */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center">

              {/* 이미지 또는 카테고리 텍스트 */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-gray-400 font-medium">{item.category}</p>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">
                  {item.name || item.category}
                </p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-xs bg-[#F0F5F0] text-[#2C5F2E] px-2 py-0.5 rounded-full font-medium">
                    {item.category}
                  </span>
                  {item.color && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {item.color}
                    </span>
                  )}
                  {item.material && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {item.material}
                    </span>
                  )}
                </div>
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDelete(item.id)}
                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

      </div>

      <BottomNav />
    </div>
  )
}