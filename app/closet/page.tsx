'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Camera, Mic, MicOff, Check, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const CATEGORIES = ['상의', '하의', '신발', '액세서리']
const TOP_LENGTHS = ['긴팔', '반팔', '민소매']
const BOTTOM_LENGTHS = ['롱', '숏', '스커트']

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

type InputMode = 'photo' | 'voice'

export default function ClosetPage() {
  const [mode, setMode] = useState<InputMode>('voice')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [length, setLength] = useState('')
  const [colorMode, setColorMode] = useState<'palette' | 'custom'>('palette')
  const [customColorText, setCustomColorText] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [parsing, setParsing] = useState(false)
  const [parseComplete, setParseComplete] = useState(false)
  const recognitionRef = useRef<any>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setVoiceSupported(false)
        // 음성 미지원 브라우저는 자동으로 사진 모드로 전환
        setMode('photo')
      }
    }
  }, [])

  const parseWithClaude = async (text: string) => {
    if (!text.trim()) return
    setParsing(true)
    setParseComplete(false)
    try {
      const res = await fetch('/api/parse-clothing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      console.log('파싱 API 응답:', data)
      if (data.category) setCategory(data.category)
      if (data.color) {
        const isKnownColor = COLORS.some((c) => c.label === data.color)
        if (isKnownColor) {
          setColorMode('palette')
          setColor(data.color)
        } else {
          // 팔레트에 없는 색이면 "기타"로 자동 전환
          setColorMode('custom')
          setCustomColorText(data.color)
          setColor(data.color)
        }
      }
      if (data.length) setLength(data.length)
      setParseComplete(true)
    } catch (e) {
      console.error('파싱 실패:', e)
    } finally {
      setParsing(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: any) => {
      const current = event.resultIndex
      const result = event.results[current]
      const text = result[0].transcript
      setTranscript(text)
      if (result.isFinal) {
        setName(text)
        parseWithClaude(text)
      }
    }

    recognition.onend = () => setIsListening(false)

    recognition.onerror = (event: any) => {
      setIsListening(false)
      if (event.error === 'not-allowed') {
        alert('마이크 접근 권한이 필요해요. 브라우저 설정에서 마이크를 허용해주세요.')
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

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
    setLength('')
    setImage(null)
    setPreview(null)
    setTranscript('')
    setParseComplete(false)
  }

  const handleSubmit = async () => {
    if (!category) return
    if (mode === 'photo' && !image) return
    if (mode === 'voice' && !name) return

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
      length: length || null,
      image_url: imageUrl,
      input_type: mode,
    })

    if (error) { alert('저장 실패'); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    resetForm()
    setTimeout(() => setSuccess(false), 3000)
  }

  const isDisabled = loading || parsing
    || !category
    || (mode === 'photo' && !image)
    || (mode === 'voice' && !name)

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
        <div className="flex gap-1.5 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setMode('voice')}
            disabled={!voiceSupported}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'voice' ? 'bg-[#2C5F2E] text-white' : 'text-gray-400 hover:text-gray-600'
            } disabled:opacity-40`}
          >
            <Mic size={13} />
            음성으로 등록
          </button>
          <button
            onClick={() => setMode('photo')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'photo' ? 'bg-[#2C5F2E] text-white' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Camera size={13} />
            사진으로 등록
          </button>
        </div>

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

        {/* 음성 입력 */}
        {mode === 'voice' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">음성으로 등록</label>
            <p className="text-xs text-gray-400 mb-4">
              마이크 버튼을 누르고 옷을 설명해주세요
            </p>

            <div className="flex flex-col items-center gap-3 py-4">
              <button
                onClick={toggleListening}
                disabled={parsing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg scale-110 animate-pulse'
                    : 'bg-[#2C5F2E] text-white hover:bg-[#234d25]'
                } disabled:opacity-50`}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
              <p className="text-xs text-gray-400">
                {isListening ? '듣는 중... 말씀해주세요' : '버튼을 눌러 시작'}
              </p>
            </div>

            {parsing && (
              <div className="flex items-center justify-center gap-2 py-3 bg-[#F0F5F0] rounded-xl">
                <Loader2 size={16} className="text-[#2C5F2E] animate-spin" />
                <p className="text-sm text-[#2C5F2E] font-medium">분석 중...</p>
              </div>
            )}

            {parseComplete && !parsing && (
              <div className="flex items-center gap-2 py-3 px-4 bg-[#F0F5F0] rounded-xl">
                <Check size={16} className="text-[#2C5F2E]" />
                <p className="text-sm text-[#2C5F2E] font-medium">자동 분류 완료! 아래에서 확인하세요</p>
              </div>
            )}

            {parseComplete && !parsing && (!category || !color || !length) && (
              <p className="text-xs text-gray-400 mt-2 px-1">
                일부 항목은 인식하지 못했어요. 아래에서 직접 선택해주세요.
              </p>
            )}

            {name && !isListening && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500 font-medium">인식된 텍스트</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setParseComplete(false)
                  }}
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setName(''); setTranscript(''); setParseComplete(false); setCategory(''); setColor(''); setLength('') }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    다시 녹음하기
                  </button>
                  <button
                    onClick={() => parseWithClaude(name)}
                    disabled={parsing || !name.trim()}
                    className="text-xs font-medium text-[#2C5F2E] hover:text-[#234d25] disabled:opacity-40 transition-colors"
                  >
                    다시 분석하기
                  </button>
                </div>
              </div>
            )}
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

        {/* 색상 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">색상</label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((col) => {
              const isSelected = colorMode === 'palette' && color === col.label
              return (
                <button
                  key={col.label}
                  onClick={() => {
                    setColorMode('palette')
                    setColor(col.label)
                    setCustomColorText('')
                  }}
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

            {/* 기타 (직접 입력) */}
            <button
              onClick={() => {
                setColorMode('custom')
                setColor(customColorText)
              }}
              title="기타"
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs text-gray-400 transition-all ${
                  colorMode === 'custom'
                    ? 'border-[#2C5F2E] scale-110 shadow-sm'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                +
              </div>
              <span className={`text-xs ${colorMode === 'custom' ? 'text-[#2C5F2E] font-medium' : 'text-gray-400'}`}>
                기타
              </span>
            </button>
          </div>

          {/* 직접 입력 필드 */}
          {colorMode === 'custom' && (
            <input
              type="text"
              value={customColorText}
              onChange={(e) => {
                setCustomColorText(e.target.value)
                setColor(e.target.value)
              }}
              placeholder="예: 민트색, 와인색"
              className="w-full mt-3 border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2C5F2E] focus:bg-white transition-colors"
            />
          )}
        </div>

        {/* 기장 (상의/하의 선택 시에만 노출) */}
        {(category === '상의' || category === '하의') && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">기장</label>
            <div className="flex flex-wrap gap-2">
              {(category === '상의' ? TOP_LENGTHS : BOTTOM_LENGTHS).map((len) => (
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

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full bg-[#2C5F2E] text-white rounded-xl py-4 text-sm font-semibold disabled:opacity-40 transition-all hover:bg-[#234d25] active:scale-[0.98]"
        >
          {loading ? '등록 중...' : parsing ? '분석 중...' : '등록하기'}
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