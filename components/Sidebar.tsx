'use client'

import Link from 'next/link'
import { House, Receipt, Search, User, ScanLine } from 'lucide-react'
import type { TabId } from './BottomTabBar'

const NAV: { id: TabId; icon: React.ElementType; label: string; href: string }[] = [
  { id: 'home',    icon: House,    label: 'Home',    href: '/' },
  { id: 'history', icon: Receipt,  label: 'History', href: '/history' },
  { id: 'search',  icon: Search,   label: 'Search',  href: '/compare' },
  { id: 'profile', icon: User,     label: 'You',     href: '/profile' },
]

// Tally mark glyph — 4 vertical lines + diagonal strike
function TallyGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 120 120" fill="none" style={{ color: 'var(--green-500)', flexShrink: 0 }}>
      <g stroke="currentColor" strokeWidth="10" strokeLinecap="round">
        <line x1="38" y1="38" x2="38" y2="82" />
        <line x1="54" y1="38" x2="54" y2="82" />
        <line x1="70" y1="38" x2="70" y2="82" />
        <line x1="86" y1="38" x2="86" y2="82" />
        <line x1="30" y1="80" x2="94" y2="40" />
      </g>
    </svg>
  )
}

export function Sidebar({ active }: { active: TabId }) {
  return (
    <aside
      className="hidden md:flex flex-col"
      style={{
        position: 'fixed',
        left: 0, top: 0,
        width: 'var(--sidebar-w)',
        height: '100%',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '22px 16px 18px',
        zIndex: 20,
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center"
        style={{ gap: 11, padding: '4px 10px 20px', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}
      >
        <TallyGlyph />
        Tally
      </div>

      {/* Nav */}
      <nav className="flex flex-col" style={{ gap: 3 }}>
        {NAV.map(({ id, icon: Icon, label, href }) => {
          const isActive = active === id
          return (
            <Link
              key={id}
              href={href}
              className="flex items-center no-underline transition-colors"
              style={{
                gap: 13,
                padding: '11px 12px',
                borderRadius: 'var(--r-md)',
                color: isActive ? 'var(--green-700)' : 'var(--ink-600)',
                background: isActive ? 'var(--green-50)' : 'transparent',
                font: '500 16px/24px var(--font-sans)',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--paper-50)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.9} color={isActive ? 'var(--green-600)' : undefined} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Scan receipt CTA */}
      <Link
        href="/scan"
        className="flex items-center justify-center no-underline"
        style={{
          gap: 8, marginTop: 16, padding: '13px 18px',
          background: 'var(--green-500)', color: '#fff',
          font: '500 16px/24px var(--font-sans)',
          borderRadius: 'var(--r-md)',
          boxShadow: '0 1px 2px rgba(14,107,64,.25)',
          transition: 'background 120ms',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--green-600)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--green-500)' }}
      >
        <ScanLine size={18} strokeWidth={2} />
        Scan receipt
      </Link>

      <div className="flex-1" />

      {/* User chip */}
      <button
        className="flex items-center w-full text-left"
        style={{
          gap: 11, padding: '12px 8px 4px',
          borderTop: '1px solid var(--border)',
          marginTop: 10,
          background: 'none', border: 'none',
          borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
          cursor: 'default',
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--r-full)',
          background: 'var(--green-500)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-sans)', flexShrink: 0,
        }}>
          G
        </div>
        <div className="flex flex-col" style={{ gap: 1 }}>
          <span style={{ font: '500 14px/20px var(--font-sans)', color: 'var(--ink-900)' }}>Guest</span>
          <span style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-400)' }}>Single user</span>
        </div>
      </button>
    </aside>
  )
}
