'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const CATEGORIES = ['상의', '하의', '신발', '액세서리']
const TOP_LENGTHS = ['긴팔', '반팔', '민소매']
const BOTTOM_LENGTHS = ['롱', '숏', '스커트']

const TOP_SUB_CATEGORIES = ['티셔츠', '블라우스', '셔츠', '니트', '맨투맨', '후드티', '민소매', '가디건', '자켓', '코트', '패딩/점퍼', '조끼']
const BOTTOM_SUB_CATEGORIES = ['데님 팬츠', '슬랙스', '트레이닝 팬츠', '스커트']

const MATERIALS = ['니트', '데님', '가죽', '울', '면', '린넨', '코듀로이', '트위드', '스웨이드']

const COLORS: { label: string; hex: string }[] = [
  { label: '화이트', hex: '#FFFFFF' },
  { label: '블랙', hex: '#1A1A1A' },
  { label: '그레이', hex: '#9E9E9E' },
  { label: '네이비', hex: '#1A2E5A' },
  { label: '블루', hex: '#4A7FC1' },
  { label: '그린', hex: '#4A8C5C' },
  { label: '레드', hex: '#C14A4A' },
  { label: '핑크', hex: '#E8A0B0' },
  { label: '베이지', hex: '#D4B896' },
  { label: '브라운', hex: '#7B5C3E' },
  { label: '옐로우', hex: '#E8C84A' },
  { label: '퍼플', hex: '#8B5CF6' },
]

export default function EditClothingItemPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [length, setLength] = useState('')
  const [color, setColor] = useState('')
  const [material, setMaterial] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [colorMode, setColorMode] = useState<'palette' | 'custom'>('palette')
  const [customColorText, setCustomColorText] = useState('')
  const [materialMode, setMaterialMode] = useState<'palette' | 'custom'>('palette')
  const [customMaterialText, setCustomMaterialText] = useState('')

  useEffect(() => {
    const fetchItem = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        alert('아이템을 찾을 수 없어요')
        router.push('/closet/list')
        return
      }

      setName(data.name || '')
      setCategory(data.category || '')
      setLength(data.length || '')
      setImageUrl(data.image_url)

      if (data.color) {
        const isKnownColor = COLORS.some((c) => c.label === data.color)
        if (isKnownColor) {
          setColorMode('palette')
          setColor(data.color)
        } else {
          setColorMode('custom')
          setCustomColorText(data.color)
          setColor(data.color)
        }
      }

      if (data.material) {
        const isKnownMaterial = MATERIALS.includes(data.material)
        if (isKnownMaterial) {
          setMaterialMode('palette')
          setMaterial(data.material)
        } else {
          setMaterialMode('custom')
          setCustomMaterialText(data.material)
          setMaterial(data.material)
        }
      }

      if (data.sub_category) setSubCategory(data.sub_category)

      setLoading(false)
    }

    fetchItem()
  }, [id])

  const handleSave = async () => {
    if (!category) return
    setSaving(true)

    const { error } = await supabase.from('clothes').update({
      name: name || null,
      category,
      length: length || null,
      color: color || null,
      material: material || null,
      sub_category: subCategory || null,
    }).eq('id', id)

    setSaving(false)

    if (error) {
      alert('저장 실패')
      return
    }

    router.push('/closet/list')
  }

  const handleDelete = async () => {
    if (!confirm('이 아이템을 삭제할까요?')) return
    await supabase.from('clothes').delete().eq('id', id)
    router.push('/closet/list')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </div>
    )
  }

  const subCategoryOptions = category === '상의' ? TOP_SUB_CATEGORIES : category === '하의' ? BOTTOM_SUB_CATEGORIES : []
  const lengthOptions = category === '상의' ? TOP_LENGTHS : category === '하의' ? BOTTOM_LENGTHS : []

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">

      {/* 헤더 */}
      <div className="px-4 pt-8 pb-4 max-w-md mx-auto flex items-center gap-3">
        <button onClick={() => router.push('/closet/list')} className="text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">옷 수정하기</h1>
      </div>

      <div className="px-4 max-w-md mx-auto space-y-3">

        {/* 이미지 (사진 등록 아이템만) */}
        {imageUrl && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <img src={imageUrl} alt={name} className="w-full h-52 object-cover rounded-xl" />
          </div>
        )}

        {/* 이름 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 브라운 니트"
            className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
          />
        </div>

        {/* 카테고리 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            카테고리 <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setLength(''); setSubCategory('') }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  category === cat
                    ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 색상 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">색상</label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((col) => {
              const isSelected = colorMode === 'palette' && color === col.label
              return (
                <button
                  key={col.label}
                  onClick={() => { setColorMode('palette'); setColor(col.label); setCustomColorText('') }}
                  title={col.label}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      isSelected ? 'border-[#2C5F2E] scale-110 shadow-sm' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className={`text-xs ${isSelected ? 'text-[#2C5F2E] font-medium' : 'text-gray-400'}`}>
                    {col.label}
                  </span>
                </button>
              )
            })}
            <button
              onClick={() => { setColorMode('custom'); setColor(customColorText) }}
              title="기타"
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs text-gray-400 transition-all ${
                  colorMode === 'custom' ? 'border-[#2C5F2E] scale-110 shadow-sm' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                +
              </div>
              <span className={`text-xs ${colorMode === 'custom' ? 'text-[#2C5F2E] font-medium' : 'text-gray-400'}`}>
                기타
              </span>
            </button>
          </div>
          {colorMode === 'custom' && (
            <input
              type="text"
              value={customColorText}
              onChange={(e) => { setCustomColorText(e.target.value); setColor(e.target.value) }}
              placeholder="예: 민트색, 와인색"
              className="w-full mt-3 border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
            />
          )}
        </div>

        {/* 기장 */}
        {lengthOptions.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">기장</label>
            <div className="flex flex-wrap gap-2">
              {lengthOptions.map((len) => (
                <button
                  key={len}
                  onClick={() => setLength(len)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    length === len
                      ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 세부 카테고리 (선택) */}
        {subCategoryOptions.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">세부 종류</label>
            <p className="text-xs text-gray-400 mb-3">선택하지 않아도 괜찮아요</p>
            <div className="flex flex-wrap gap-2">
              {subCategoryOptions.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubCategory(subCategory === sub ? '' : sub)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    subCategory === sub
                      ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 소재 (선택) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">소재</label>
          <p className="text-xs text-gray-400 mb-3">선택하지 않아도 괜찮아요</p>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((mat) => (
              <button
                key={mat}
                onClick={() => { setMaterialMode('palette'); setMaterial(mat); setCustomMaterialText('') }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  materialMode === 'palette' && material === mat
                    ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {mat}
              </button>
            ))}
            <button
              onClick={() => { setMaterialMode('custom'); setMaterial(customMaterialText) }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                materialMode === 'custom'
                  ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              기타
            </button>
          </div>
          {materialMode === 'custom' && (
            <input
              type="text"
              value={customMaterialText}
              onChange={(e) => { setCustomMaterialText(e.target.value); setMaterial(e.target.value) }}
              placeholder="예: 폴리에스터, 캐시미어"
              className="w-full mt-3 border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
            />
          )}
        </div>

        {/* 저장 / 취소 */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => router.push('/closet/list')}
            className="flex-1 bg-white border border-gray-200 text-gray-600 rounded-xl py-4 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !category}
            className="flex-1 bg-[#2C5F2E] text-white rounded-xl py-4 text-sm font-semibold disabled:opacity-40 transition-all hover:bg-[#234d25] active:scale-[0.98]"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>

        {/* 삭제 */}
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-sm text-red-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
          이 아이템 삭제하기
        </button>

      </div>

      <BottomNav />
    </div>
  )
}