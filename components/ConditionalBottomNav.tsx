'use client'

import { usePathname } from 'next/navigation'
import { BottomTabBar, type TabId } from './BottomTabBar'

const TAB_ROUTES: Record<string, TabId> = {
  '/': 'home',
  '/history': 'history',
  '/compare': 'search',
  '/profile': 'profile',
}

export function ConditionalBottomNav() {
  const pathname = usePathname()
  const activeTab = TAB_ROUTES[pathname]
  if (!activeTab) return null
  return <BottomTabBar active={activeTab} />
}
