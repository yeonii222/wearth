'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Camera, Type, Check } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const CATEGORIES = ['상의', '하의', '아우터', '신발', '액세서리']

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

const MATERIALS = ['면', '울', '니트', '린넨', '폴리에스터', '데님', '가죽', '시폰', '벨벳', '기타']

type InputMode = 'text' | 'photo'

export default function ClosetPage() {
  const [mode, setMode] = useState<InputMode>('text')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [material, setMaterial] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setName('')
    setCategory('')
    setColor('')
    setMaterial('')
    setImage(null)
    setPreview(null)
  }

  const handleSubmit = async () => {
    if (!category) return
    if (mode === 'text' && !name) return
    if (mode === 'photo' && !image) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    let imageUrl: string | null = null

    if (mode === 'photo' && image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('clothes').upload(fileName, image)
      if (uploadError) { alert('이미지 업로드 실패'); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('clothes').getPublicUrl(fileName)
      imageUrl = publicUrl
    }

    const { error } = await supabase.from('clothes').insert({
      user_id: user.id,
      name: name || null,
      category,
      color: color || null,
      material: material || null,
      image_url: imageUrl,
      input_type: mode,
    })

    if (error) { alert('저장 실패'); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    resetForm()
    setTimeout(() => setSuccess(false), 3000)
  }

  const isDisabled = loading || !category || (mode === 'text' && !name) || (mode === 'photo' && !image)

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">

      {/* 헤더 */}
      <div className="px-4 pt-8 pb-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-900">옷 등록하기</h1>
        <p className="text-sm text-gray-400 mt-1">내 옷장에 새 아이템을 추가해요</p>
      </div>

      {/* 성공 토스트 */}
      {success && (
        <div className="px-4 max-w-md mx-auto mb-2">
          <div className="bg-[#2C5F2E] text-white rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <Check size={16} />
            등록 완료! 계속 추가하세요.
          </div>
        </div>
      )}

      <div className="px-4 max-w-md mx-auto space-y-3">

        {/* 입력 방식 탭 */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'text' ? 'bg-[#2C5F2E] text-white' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Type size={14} />
            텍스트로 등록
          </button>
          <button
            onClick={() => setMode('photo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'photo' ? 'bg-[#2C5F2E] text-white' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Camera size={14} />
            사진으로 등록
          </button>
        </div>

        {/* 텍스트 입력 */}
        {mode === 'text' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">옷 이름 또는 설명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 연핑크 알파카 니트"
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
            />
          </div>
        )}

        {/* 사진 업로드 */}
        {mode === 'photo' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">사진 추가</label>
            <label className="block cursor-pointer">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="미리보기" className="w-full h-52 object-cover rounded-xl" />
                  <div className="absolute inset-0 rounded-xl bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">사진 변경</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-52 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#2C5F2E] hover:text-[#2C5F2E] transition-colors">
                  <Camera size={28} strokeWidth={1.5} />
                  <p className="text-sm">사진을 선택하세요</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        )}

        {/* 카테고리 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            카테고리 <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
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

        {/* 색상 — 컬러 칩 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">색상</label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((col) => {
              const isSelected = color === col.label
              return (
                <button
                  key={col.label}
                  onClick={() => setColor(col.label)}
                  title={col.label}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-[#2C5F2E] scale-110 shadow-sm'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className={`text-xs ${isSelected ? 'text-[#2C5F2E] font-medium' : 'text-gray-400'}`}>
                    {col.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 소재 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">소재</label>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((mat) => (
              <button
                key={mat}
                onClick={() => setMaterial(mat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  material === mat
                    ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full bg-[#2C5F2E] text-white rounded-xl py-4 text-sm font-semibold disabled:opacity-40 transition-all hover:bg-[#234d25] active:scale-[0.98]"
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>

        <button
          onClick={() => router.push('/closet/list')}
          className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          내 옷장 보기 →
        </button>

      </div>

      <BottomNav />
    </div>
  )
}