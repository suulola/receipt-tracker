'use client'

import { usePathname } from 'next/navigation'
import { BottomTabBar, type TabId } from './BottomTabBar'
import { Sidebar } from './Sidebar'

const EXACT_ROUTES: Record<string, TabId> = {
  '/': 'home',
  '/history': 'history',
  '/compare': 'search',
  '/profile': 'profile',
}

// Sub-routes inherit their parent tab's highlight
const PREFIX_ROUTES: [string, TabId][] = [
  ['/receipts', 'history'],
  ['/compare/', 'search'],
]

function resolveTab(pathname: string): TabId | undefined {
  if (EXACT_ROUTES[pathname]) return EXACT_ROUTES[pathname]
  for (const [prefix, tab] of PREFIX_ROUTES) {
    if (pathname.startsWith(prefix)) return tab
  }
  return undefined
}

export function ConditionalBottomNav() {
  const pathname = usePathname()
  const activeTab = resolveTab(pathname)
  const exactTab = EXACT_ROUTES[pathname]
  return (
    <>
      {/* Sidebar always visible on desktop; active may be undefined on unmatched pages */}
      <Sidebar active={activeTab} />
      {/* Bottom nav only on top-level tab pages */}
      {exactTab && <BottomTabBar active={exactTab} />}
    </>
  )
}
