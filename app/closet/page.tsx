'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import BottomNav from '@/components/BottomNav'

const CATEGORIES = ['상의', '하의', '아우터', '신발', '액세서리']
const COLORS = ['화이트', '블랙', '그레이', '네이비', '블루', '그린', '레드', '핑크', '베이지', '브라운', '옐로우', '퍼플']
const MATERIALS = ['면', '울', '니트', '린넨', '폴리에스터', '데님', '가죽', '시폰', '벨벳', '기타']

type InputMode = 'photo' | 'text'

export default function ClosetPage() {
  const [mode, setMode] = useState<InputMode>('text')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [name, setName] = useState('')
  const [material, setMaterial] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
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
    if (!user) {
      router.push('/auth/login')
      return
    }

    let imageUrl: string | null = null

    if (mode === 'photo' && image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('clothes')
        .upload(fileName, image)

      if (uploadError) {
        alert('이미지 업로드 실패')
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(fileName)
      imageUrl = publicUrl
    }

    const { error } = await supabase
      .from('clothes')
      .insert({
        user_id: user.id,
        name: name || null,
        category,
        color: color || null,
        material: material || null,
        image_url: imageUrl,
        input_type: mode,
      })

    if (error) {
      alert('저장 실패')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    resetForm()
    setTimeout(() => setSuccess(false), 3000)
  }

  const isSubmitDisabled = () => {
    if (loading) return true
    if (!category) return true
    if (mode === 'text' && !name) return true
    if (mode === 'photo' && !image) return true
    return false
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-gray-800">옷 등록하기</h1>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-green-700 text-sm text-center">
            ✅ 등록 완료! 계속 추가하세요.
          </div>
        )}

        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'text' ? 'bg-[#2C5F2E] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✏️ 텍스트로 등록
          </button>
          <button
            onClick={() => setMode('photo')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'photo' ? 'bg-[#2C5F2E] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📷 사진으로 등록
          </button>
        </div>

        {mode === 'text' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">옷 이름 또는 설명</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 알파카 니트 연핑크 피셔맨 니트"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E]"
            />
          </div>
        )}

        {mode === 'photo' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">사진 추가</p>
            <label className="block cursor-pointer">
              {preview ? (
                <img src={preview} alt="미리보기" className="w-full h-48 object-cover rounded-xl" />
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <p className="text-3xl mb-2">📷</p>
                  <p className="text-sm">사진을 선택하세요</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">카테고리 <span className="text-red-400">*</span></p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  category === cat
                    ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">색상</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((col) => (
              <button
                key={col}
                onClick={() => setColor(col)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  color === col
                    ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">소재</p>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((mat) => (
              <button
                key={mat}
                onClick={() => setMaterial(mat)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  material === mat
                    ? 'bg-[#2C5F2E] text-white border-[#2C5F2E]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled()}
          className="w-full bg-[#2C5F2E] text-white rounded-xl py-4 font-medium disabled:opacity-50 transition-colors hover:bg-[#234d25]"
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>

        <button
          onClick={() => router.push('/closet/list')}
          className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-gray-700"
        >
          내 옷장 보기 →
        </button>

      </div>

      <BottomNav />
    </div>
  )
}