export type Role = 'PPS_OFFICER' | 'SHIP_OWNER' | 'BUYER' | 'ADMIN'

export type LandingStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
export type InvoiceStatus = 'PENDING' | 'PAID' | 'CONFIRMED'
export type AnyStatus = LandingStatus | InvoiceStatus

export type CrewTagColor =
  | 'Merah' | 'Biru' | 'Hijau' | 'Kuning'
  | 'Putih' | 'Hitam' | 'Oranye' | 'Ungu'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  /** Aktif / nonaktif — dipakai di Manajemen Pengguna (Admin) */
  is_active?: boolean
}

export interface Ship {
  id: number
  vessel_name: string
  vessel_code: string
  owner_user_id: number
  capacity_ton: number
}

export interface Crew {
  id: number
  ship_id: number
  name: string
  crew_tag_color: CrewTagColor
  identification_number: string
}

export interface FishCategory {
  id: number
  category_name: string
  /** Tarif PNBP per Kg (Rupiah) */
  pnbp_rate: number
  /** Harga jual estimasi per Kg (Rupiah) */
  price_per_kg?: number
  color: string
}

export interface Scale {
  id: number
  unique_scale_id: string
  location: string
  /** 1 = online, 0 = offline */
  status: 0 | 1
  last_calibrated_at?: string
}

export interface Landing {
  id: number
  ship_id: number
  ship: Ship
  landing_date: string
  pps_officer_id: number
  officer: User
  status: LandingStatus
}

export interface WeighingRecord {
  id: number
  landing_id: number
  scale_id: number
  fish_category_id: number
  weight_kg: number
  /** Hasil deteksi kualitas — null selama modul AI belum terpasang */
  confidence_score: number | null
  quality_grade: string | null
  photo_url: string | null
  /** Tag ABK yang dialokasikan; null = masih di antrian Tag ABK */
  crew_id: number | null
  weighed_at: string
  is_voided: boolean
  /** Terisi setelah dibeli — mencegah satu hasil tangkapan terjual dua kali. */
  invoice_id?: number | null
}

export interface InvoiceItem {
  weighing_record_id: number
  fish_category_id: number
  weight_kg: number
  price_per_kg: number
  subtotal: number
}

export interface Invoice {
  id: number
  invoice_number: string
  buyer_user_id: number
  items: InvoiceItem[]
  subtotal: number
  handling_fee: number
  total: number
  status: InvoiceStatus
  created_at: string
  paid_at: string | null
}

/** Riwayat scan morfologi, bisa dikaitkan ke satu record penimbangan. */
export interface MorphologyScan {
  id: number
  weighing_record_id: number | null
  landing_id: number | null
  detected_category: string
  confidence_score: number
  quality_grade: string
  estimated_length_cm: number
  processing_time_ms: number
  source: string
  scanned_at: string
}
