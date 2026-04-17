'use client'

import { useState } from 'react'

interface EmailFormProps {
  placeholder?: string
  buttonText?: string
  variant?: 'light' | 'dark'
}

export default function EmailForm({
  placeholder = '이메일을 입력해주세요',
  buttonText = '얼리액세스 신청',
  variant = 'light',
}: EmailFormProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-white/20 px-6 py-4 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4F7B5F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <p className={variant === 'dark' ? 'text-white font-medium' : 'text-[#4F7B5F] font-medium'}>
          신청이 완료됐어요! 곧 연락드릴게요.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <div className="flex flex-1 flex-col gap-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={`h-12 flex-1 rounded-full border px-5 text-sm outline-none transition-all focus:ring-2 ${
            variant === 'dark'
              ? 'border-white/30 bg-white/10 text-white placeholder-white/60 focus:border-white focus:ring-white/30'
              : 'border-[#4F7B5F]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#4F7B5F] focus:ring-[#4F7B5F]/20'
          }`}
        />
        {error && <p className="pl-4 text-xs text-red-400">{error}</p>}
      </div>
      <button
        type="submit"
        className={`h-12 cursor-pointer rounded-full px-6 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
          variant === 'dark'
            ? 'bg-white text-[#4F7B5F] hover:bg-white/90'
            : 'bg-[#4F7B5F] text-white hover:bg-[#3a5c47]'
        }`}
      >
        {buttonText}
      </button>
    </form>
  )
}
