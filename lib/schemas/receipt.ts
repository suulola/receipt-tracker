import { z } from 'zod'

export const ItemCategory = z.enum([
  'fruits',
  'vegetables',
  'dairy',
  'meat',
  'seafood',
  'bakery',
  'beverages',
  'snacks',
  'frozen',
  'canned_goods',
  'household',
  'cleaning',
  'stationery',
  'electronics',
  'clothing',
  'health_beauty',
  'tools_hardware',
  'other',
])

export type ItemCategoryType = z.infer<typeof ItemCategory>

export const CATEGORY_LABELS: Record<ItemCategoryType, string> = {
  fruits: 'Fruits',
  vegetables: 'Vegetables',
  dairy: 'Dairy',
  meat: 'Meat',
  seafood: 'Seafood',
  bakery: 'Bakery',
  beverages: 'Beverages',
  snacks: 'Snacks',
  frozen: 'Frozen',
  canned_goods: 'Canned Goods',
  household: 'Household',
  cleaning: 'Cleaning',
  stationery: 'Stationery',
  electronics: 'Electronics',
  clothing: 'Clothing',
  health_beauty: 'Health & Beauty',
  tools_hardware: 'Tools & Hardware',
  other: 'Other',
}

export const ReceiptItemSchema = z.object({
  rawName: z.string().describe('Exact item name as printed on the receipt'),
  category: ItemCategory.describe('Real-world category of this item regardless of store type'),
  quantity: z.number().positive().optional().describe('Numeric quantity purchased'),
  unit: z
    .string()
    .optional()
    .describe('Unit of measurement: lb, kg, L, mL, each, pack, bag, box, etc.'),
  unitPrice: z.number().positive().optional().describe('Price per single unit'),
  totalPrice: z.number().positive().describe('Total price for this line item'),
  savings: z
    .number()
    .nonnegative()
    .optional()
    .describe('Discount or savings amount shown on receipt for this item'),
})

export const ReceiptSchema = z.object({
  store: z.object({
    name: z.string().describe('Store or chain name e.g. CANADIAN TIRE, COSTCO, FOOD BASICS'),
    branch: z
      .string()
      .optional()
      .describe('Branch number or location name e.g. #139 or Stanley Park Mall'),
    address: z.string().optional().describe('Street address of the store'),
    city: z.string().optional().describe('City where the store is located'),
    province: z
      .string()
      .optional()
      .describe('Two-letter Canadian province code e.g. ON, BC, AB, QC'),
    postalCode: z.string().optional().describe('Canadian postal code e.g. N2A 1H2'),
    phone: z.string().optional().describe('Store phone number if printed'),
  }),
  customerName: z
    .string()
    .optional()
    .describe(
      'Loyalty or membership customer name if explicitly printed on receipt (e.g. Costco member name). Omit if not present — do not use operator or cashier fields.',
    ),
  transactionDate: z
    .string()
    .optional()
    .describe('Purchase date in ISO 8601 format YYYY-MM-DD'),
  transactionNumber: z.string().optional().describe('Transaction or receipt number'),
  items: z.array(ReceiptItemSchema).min(1).describe('All line items purchased'),
  subtotal: z.number().nonnegative().optional().describe('Subtotal before tax'),
  tax: z.number().nonnegative().optional().describe('Total tax amount (HST, GST, PST)'),
  total: z.number().positive().optional().describe('Final total paid'),
  imageCount: z
    .number()
    .int()
    .positive()
    .describe('Number of receipt images that were processed'),
})

export type Receipt = z.infer<typeof ReceiptSchema>
export type ReceiptItem = z.infer<typeof ReceiptItemSchema>
