export const CATEGORY_COLORS: Record<string, string> = {
  fruits:         'bg-green-100 text-green-700',
  vegetables:     'bg-lime-100 text-lime-700',
  dairy:          'bg-blue-100 text-blue-700',
  meat:           'bg-red-100 text-red-700',
  seafood:        'bg-cyan-100 text-cyan-700',
  bakery:         'bg-amber-100 text-amber-700',
  beverages:      'bg-sky-100 text-sky-700',
  snacks:         'bg-orange-100 text-orange-700',
  frozen:         'bg-indigo-100 text-indigo-700',
  canned_goods:   'bg-yellow-100 text-yellow-700',
  household:      'bg-purple-100 text-purple-700',
  cleaning:       'bg-teal-100 text-teal-700',
  stationery:     'bg-rose-100 text-rose-700',
  electronics:    'bg-violet-100 text-violet-700',
  clothing:       'bg-pink-100 text-pink-700',
  health_beauty:  'bg-fuchsia-100 text-fuchsia-700',
  tools_hardware: 'bg-stone-100 text-stone-700',
  other:          'bg-neutral-100 text-neutral-600',
}

export function categoryColor(slug: string): string {
  return CATEGORY_COLORS[slug] ?? CATEGORY_COLORS.other
}
