'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, Shirt, User } from 'lucide-react'

const tabs = [
  { label: '홈', icon: Home, path: '/home' },
  { label: '옷장', icon: Shirt, path: '/closet' },
  { label: '프로필', icon: User, path: '/profile' },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/')
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-1 py-1 px-4 transition-colors ${
                isActive ? 'text-[#2C5F2E]' : 'text-gray-400'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}