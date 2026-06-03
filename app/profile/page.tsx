'use client'

import { User, Bell, HelpCircle, Info } from 'lucide-react'

const SETTINGS = [
  { icon: Bell,        label: 'Notifications',    caption: 'Coming soon' },
  { icon: HelpCircle,  label: 'Help & feedback',  caption: 'Send us a note' },
  { icon: Info,        label: 'About Tally',       caption: 'Version 0.1.0' },
]

export default function ProfilePage() {
  return (
    <main className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)', paddingBottom: 'var(--tabbar-h)' }}>
      <div style={{ padding: '24px var(--gutter) 8px' }}>
        <h1 style={{ font: '700 26px/30px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>
          You
        </h1>
      </div>

      <div className="flex-1" style={{ padding: '16px var(--gutter) 0' }}>
        {/* Profile row */}
        <div className="flex items-center" style={{ gap: 14, paddingBottom: 20 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 'var(--r-full)',
            background: 'var(--green-500)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-sans)', flexShrink: 0,
          }}>
            <User size={26} strokeWidth={1.9} />
          </div>
          <div>
            <p style={{ font: '600 17px/22px var(--font-sans)', color: 'var(--ink-900)' }}>Guest</p>
            <p style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-400)', marginTop: 2 }}>Auth coming soon</p>
          </div>
        </div>

        {/* Settings */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          {SETTINGS.map(({ icon: Icon, label, caption }, i) => (
            <button
              key={label}
              disabled
              className="flex items-center w-full text-left"
              style={{
                gap: 13, padding: '14px 15px',
                borderTop: i > 0 ? '1px solid var(--border)' : undefined,
                background: 'transparent', border: 'none', cursor: 'default',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-sm)',
                background: 'var(--paper-100)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={18} strokeWidth={1.9} color="var(--ink-600)" />
              </div>
              <div className="flex-1">
                <p style={{ font: '500 16px/24px var(--font-sans)', color: 'var(--ink-900)' }}>{label}</p>
              </div>
              <span style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-400)' }}>{caption}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
