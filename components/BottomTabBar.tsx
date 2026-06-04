'use client'

import Link from 'next/link'
import { House, Receipt, ScanLine, Search, User } from 'lucide-react'

export type TabId = 'home' | 'history' | 'search' | 'profile'

export function BottomTabBar({ active }: { active: TabId }) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-20"
      style={{
        height: 'var(--tabbar-h)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--paper-200)',
      }}
    >
      <div className="flex items-start justify-around px-[18px] pt-[10px]">
        <TabItem href="/" icon={House} label="Home" isActive={active === 'home'} />
        <TabItem href="/history" icon={Receipt} label="History" isActive={active === 'history'} />

        {/* Raised scan FAB */}
        <div className="flex flex-col items-center" style={{ marginTop: -22 }}>
          <Link
            href="/scan"
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              background: 'var(--green-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(31,164,99,.42), 0 2px 4px rgba(27,26,22,.12)',
              transition: 'transform 120ms',
            }}
            aria-label="Scan receipt"
          >
            <ScanLine size={26} strokeWidth={2.2} color="#fff" />
          </Link>
        </div>

        <TabItem href="/compare" icon={Search} label="Search" isActive={active === 'search'} />
        <TabItem href="/profile" icon={User} label="You" isActive={active === 'profile'} />
      </div>
    </div>
  )
}

function TabItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center no-underline"
      style={{
        gap: 3,
        color: isActive ? 'var(--green-600)' : 'var(--ink-400)',
        width: 56,
        paddingTop: 2,
      }}
    >
      <Icon size={23} strokeWidth={isActive ? 2.2 : 1.9} />
      <span style={{ font: '600 10px/1 var(--font-sans)' }}>{label}</span>
    </Link>
  )
}
