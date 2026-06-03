// API response shapes — mirroring the FastAPI Pydantic schemas (camelCase via alias_generator)

export interface StoreOut {
  id: string
  name: string
  branch: string | null
  address: string | null
  city: string | null
  province: string | null
  postalCode: string | null
}

export interface ReceiptItemOut {
  id: string
  rawName: string
  normalizedName: string
  categorySlug: string
  categoryLabel: string
  quantity: number | null
  unit: string | null
  unitPrice: number | null
  totalPrice: number
  savings: number | null
}

export interface ReceiptOut {
  id: string
  store: StoreOut
  purchaseDate: string | null
  transactionNumber: string | null
  customerName: string | null
  items: ReceiptItemOut[]
  subtotal: number | null
  tax: number | null
  total: number | null
  imageCount: number
  createdAt: string
}

export interface ReceiptListItem {
  id: string
  storeName: string
  storeBranch: string | null
  storeCity: string | null
  purchaseDate: string | null
  total: number | null
  itemCount: number
  createdAt: string
}
