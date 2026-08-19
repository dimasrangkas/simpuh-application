import type { Crew, FishCategory, Landing, Scale, Ship, User, WeighingRecord } from '@/types'

export const USERS: User[] = [
  { id: 1, name: 'Budi Santoso', email: 'budi@pps.kkp.go.id', role: 'PPS_OFFICER', is_active: true },
  { id: 2, name: 'Agus Wijaya', email: 'agus@kapal.com', role: 'SHIP_OWNER', is_active: true },
  { id: 3, name: 'PT Maju Jaya', email: 'buyer@majujaya.com', role: 'BUYER', is_active: true },
  { id: 4, name: 'Siti Nurhaliza', email: 'siti@pps.kkp.go.id', role: 'PPS_OFFICER', is_active: true },
  { id: 5, name: 'Admin SIMPUH', email: 'admin@pps.kkp.go.id', role: 'ADMIN', is_active: true },
]

export const SHIPS: Ship[] = [
  { id: 1, vessel_name: 'KM Mina Jaya 01', vessel_code: 'MJ-001', owner_user_id: 2, capacity_ton: 50 },
  { id: 2, vessel_name: 'KM Samudra Raya', vessel_code: 'SR-002', owner_user_id: 2, capacity_ton: 75 },
  { id: 3, vessel_name: 'KM Nelayan Sejahtera', vessel_code: 'NS-003', owner_user_id: 2, capacity_ton: 60 },
]

export const CREWS: Crew[] = [
  { id: 1, ship_id: 1, name: 'Ahmad Zainudin', crew_tag_color: 'Merah', identification_number: '3301010101010001' },
  { id: 2, ship_id: 1, name: 'Muhammad Ridwan', crew_tag_color: 'Biru', identification_number: '3301010101010002' },
  { id: 3, ship_id: 1, name: 'Sutrisno', crew_tag_color: 'Hijau', identification_number: '3301010101010003' },
  { id: 4, ship_id: 1, name: 'Bambang Supriadi', crew_tag_color: 'Kuning', identification_number: '3301010101010004' },
  { id: 5, ship_id: 1, name: 'Joko Widodo', crew_tag_color: 'Putih', identification_number: '3301010101010005' },
]

export const FISH_CATEGORIES: FishCategory[] = [
  { id: 1, category_name: 'Ikan Cakalang', pnbp_rate: 250, price_per_kg: 32000, color: '#3b82f6' },
  { id: 2, category_name: 'Ikan Tongkol', pnbp_rate: 200, price_per_kg: 28000, color: '#8b5cf6' },
  { id: 3, category_name: 'Ikan Tuna', pnbp_rate: 500, price_per_kg: 85000, color: '#ec4899' },
  { id: 4, category_name: 'Cumi', pnbp_rate: 150, price_per_kg: 45000, color: '#f59e0b' },
]

export const SCALES: Scale[] = [
  { id: 1, unique_scale_id: 'SCALE-PPS-001', location: 'Dermaga A - Pos 1', status: 1, last_calibrated_at: '2026-07-02T09:00:00' },
  { id: 2, unique_scale_id: 'SCALE-PPS-002', location: 'Dermaga A - Pos 2', status: 1, last_calibrated_at: '2026-06-18T10:30:00' },
  { id: 3, unique_scale_id: 'SCALE-PPS-003', location: 'Dermaga B - Pos 1', status: 0, last_calibrated_at: '2026-05-30T14:15:00' },
]

export const LANDINGS: Landing[] = [
  { id: 1, ship_id: 1, ship: SHIPS[0], landing_date: '2026-08-19T08:30:00', pps_officer_id: 1, officer: USERS[0], status: 'IN_PROGRESS' },
  { id: 2, ship_id: 2, ship: SHIPS[1], landing_date: '2026-08-19T06:15:00', pps_officer_id: 4, officer: USERS[3], status: 'IN_PROGRESS' },
  { id: 3, ship_id: 3, ship: SHIPS[2], landing_date: '2026-08-18T16:45:00', pps_officer_id: 1, officer: USERS[0], status: 'COMPLETED' },
]

export const WEIGHING_RECORDS: WeighingRecord[] = [
  { id: 1, landing_id: 1, scale_id: 1, fish_category_id: 1, weight_kg: 124.5, confidence_score: 95.8, quality_grade: 'Baik', photo_url: null, crew_id: 1, weighed_at: '2026-08-19T08:45:00', is_voided: false },
  { id: 2, landing_id: 1, scale_id: 1, fish_category_id: 3, weight_kg: 86.2, confidence_score: 92.4, quality_grade: 'Sedang', photo_url: null, crew_id: 2, weighed_at: '2026-08-19T09:02:00', is_voided: false },
  { id: 3, landing_id: 1, scale_id: 2, fish_category_id: 2, weight_kg: 210.0, confidence_score: 97.1, quality_grade: 'Baik', photo_url: null, crew_id: null, weighed_at: '2026-08-19T09:20:00', is_voided: false },
  { id: 4, landing_id: 1, scale_id: 1, fish_category_id: 4, weight_kg: 45.75, confidence_score: 88.9, quality_grade: 'Kurang', photo_url: null, crew_id: null, weighed_at: '2026-08-19T09:35:00', is_voided: false },
  { id: 5, landing_id: 2, scale_id: 2, fish_category_id: 1, weight_kg: 168.3, confidence_score: 96.2, quality_grade: 'Baik', photo_url: null, crew_id: null, weighed_at: '2026-08-19T07:10:00', is_voided: false },
  { id: 6, landing_id: 3, scale_id: 1, fish_category_id: 3, weight_kg: 302.4, confidence_score: 94.0, quality_grade: 'Baik', photo_url: null, crew_id: 3, weighed_at: '2026-08-18T17:20:00', is_voided: false },
]
