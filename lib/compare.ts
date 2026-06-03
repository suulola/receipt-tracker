import type { CompareResult, StoreGroup } from '@/lib/types/api'

export function groupByStore(results: CompareResult[]): StoreGroup[] {
  const map = new Map<string, StoreGroup>()

  for (const r of results) {
    const key = [r.storeName, r.storeBranch ?? '', r.storeCity ?? ''].join('|')
    if (!map.has(key)) {
      map.set(key, {
        key,
        storeName: r.storeName,
        storeBranch: r.storeBranch,
        storeCity: r.storeCity,
        rows: [],
        bestPricePerUnit: null,
        bestUnit: null,
      })
    }
    map.get(key)!.rows.push(r)
  }

  for (const group of map.values()) {
    const withUnit = group.rows.filter((r) => r.pricePerUnit != null)
    if (withUnit.length > 0) {
      const best = withUnit.reduce((a, b) => a.pricePerUnit! <= b.pricePerUnit! ? a : b)
      group.bestPricePerUnit = best.pricePerUnit
      group.bestUnit = best.unit
    }
  }

  return [...map.values()].sort((a, b) => {
    if (a.bestPricePerUnit == null) return 1
    if (b.bestPricePerUnit == null) return -1
    return a.bestPricePerUnit - b.bestPricePerUnit
  })
}

export function getDistinctUnits(results: CompareResult[]): string[] {
  return [...new Set(results.map((r) => r.unit).filter((u): u is string => !!u))]
}
