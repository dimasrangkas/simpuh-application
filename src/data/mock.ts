import type { Crew, FishCategory, Landing, Scale, Ship, User, WeighingRecord } from '@/types'

export const USERS: User[] = [
  { id: 1, name: 'Budi Santoso', email: 'budi@pps.kkp.go.id', role: 'PPS_OFFICER', is_active: true },
  { id: 2, name: 'Agus Wijaya', email: 'agus@kapal.com', role: 'SHIP_OWNER', is_active: true },
  { id: 3, name: 'PT Maju Jaya', email: 'buyer@majujaya.com', role: 'BUYER', is_active: true },
  { id: 4, name: 'Siti Nurhaliza', email: 'siti@pps.kkp.go.id', role: 'PPS_OFFICER', is_active: true },
  { id: 5, name: 'Admin SIMPUH', email: 'admin@pps.kkp.go.id', role: 'ADMIN', is_active: true },
  // Pemilik kedua — dipakai untuk memastikan data antar pemilik benar-benar terpisah.
  { id: 6, name: 'Hendra Kusuma', email: 'hendra@kapal.com', role: 'SHIP_OWNER', is_active: true },
]

export const SHIPS: Ship[] = [
  // Milik Agus Wijaya (id 2)
  { id: 1, vessel_name: 'KM Mina Jaya 01', vessel_code: 'MJ-001', owner_user_id: 2, capacity_ton: 50 },
  { id: 2, vessel_name: 'KM Samudra Raya', vessel_code: 'SR-002', owner_user_id: 2, capacity_ton: 75 },
  { id: 3, vessel_name: 'KM Nelayan Sejahtera', vessel_code: 'NS-003', owner_user_id: 2, capacity_ton: 60 },
  // Milik Hendra Kusuma (id 6)
  { id: 4, vessel_name: 'KM Bahari Indah', vessel_code: 'BI-004', owner_user_id: 6, capacity_ton: 45 },
  { id: 5, vessel_name: 'KM Cakrawala 07', vessel_code: 'CK-007', owner_user_id: 6, capacity_ton: 90 },
]

/** Warna tag wajib unik dalam satu kapal — validasi ini ditegakkan di halaman Data Kapal. */
export const CREWS: Crew[] = [
  // KM Mina Jaya 01
  { id: 1, ship_id: 1, name: 'Ahmad Zainudin', crew_tag_color: 'Merah', identification_number: '3301010101010001' },
  { id: 2, ship_id: 1, name: 'Muhammad Ridwan', crew_tag_color: 'Biru', identification_number: '3301010101010002' },
  { id: 3, ship_id: 1, name: 'Sutrisno', crew_tag_color: 'Hijau', identification_number: '3301010101010003' },
  { id: 4, ship_id: 1, name: 'Bambang Supriadi', crew_tag_color: 'Kuning', identification_number: '3301010101010004' },
  { id: 5, ship_id: 1, name: 'Slamet Riyadi', crew_tag_color: 'Putih', identification_number: '3301010101010005' },
  // KM Samudra Raya
  { id: 6, ship_id: 2, name: 'Warsito', crew_tag_color: 'Merah', identification_number: '3301010102020001' },
  { id: 7, ship_id: 2, name: 'Dedi Kurniawan', crew_tag_color: 'Biru', identification_number: '3301010102020002' },
  { id: 8, ship_id: 2, name: 'Rahmat Hidayat', crew_tag_color: 'Hijau', identification_number: '3301010102020003' },
  { id: 9, ship_id: 2, name: 'Yusuf Maulana', crew_tag_color: 'Kuning', identification_number: '3301010102020004' },
  { id: 10, ship_id: 2, name: 'Iwan Setiawan', crew_tag_color: 'Oranye', identification_number: '3301010102020005' },
  // KM Nelayan Sejahtera
  { id: 11, ship_id: 3, name: 'Sugeng Prayitno', crew_tag_color: 'Merah', identification_number: '3301010103030001' },
  { id: 12, ship_id: 3, name: 'Tarmizi', crew_tag_color: 'Biru', identification_number: '3301010103030002' },
  { id: 13, ship_id: 3, name: 'Nur Kholis', crew_tag_color: 'Hijau', identification_number: '3301010103030003' },
  { id: 14, ship_id: 3, name: 'Eko Prasetyo', crew_tag_color: 'Ungu', identification_number: '3301010103030004' },
  // KM Bahari Indah (Hendra)
  { id: 15, ship_id: 4, name: 'Fajar Nugroho', crew_tag_color: 'Merah', identification_number: '3301010104040001' },
  { id: 16, ship_id: 4, name: 'Anwar Sanusi', crew_tag_color: 'Biru', identification_number: '3301010104040002' },
  { id: 17, ship_id: 4, name: 'Rudi Hartono', crew_tag_color: 'Hijau', identification_number: '3301010104040003' },
  // KM Cakrawala 07 (Hendra)
  { id: 18, ship_id: 5, name: 'Bagus Permana', crew_tag_color: 'Merah', identification_number: '3301010105050001' },
  { id: 19, ship_id: 5, name: 'Hasan Basri', crew_tag_color: 'Kuning', identification_number: '3301010105050002' },
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

const shipById = (id: number) => SHIPS.find((s) => s.id === id)!
const userById = (id: number) => USERS.find((u) => u.id === id)!

/** Riwayat sengaja menyebar beberapa minggu agar filter tanggal di Laporan ada isinya. */
export const LANDINGS: Landing[] = [
  { id: 1, ship_id: 1, ship: shipById(1), landing_date: '2026-08-19T08:30:00', pps_officer_id: 1, officer: userById(1), status: 'IN_PROGRESS' },
  { id: 2, ship_id: 2, ship: shipById(2), landing_date: '2026-08-19T06:15:00', pps_officer_id: 4, officer: userById(4), status: 'IN_PROGRESS' },
  { id: 3, ship_id: 3, ship: shipById(3), landing_date: '2026-08-18T16:45:00', pps_officer_id: 1, officer: userById(1), status: 'COMPLETED' },
  { id: 4, ship_id: 1, ship: shipById(1), landing_date: '2026-08-15T07:20:00', pps_officer_id: 1, officer: userById(1), status: 'COMPLETED' },
  { id: 5, ship_id: 2, ship: shipById(2), landing_date: '2026-08-12T05:50:00', pps_officer_id: 4, officer: userById(4), status: 'COMPLETED' },
  { id: 6, ship_id: 1, ship: shipById(1), landing_date: '2026-08-08T09:10:00', pps_officer_id: 4, officer: userById(4), status: 'COMPLETED' },
  { id: 7, ship_id: 3, ship: shipById(3), landing_date: '2026-08-05T15:30:00', pps_officer_id: 1, officer: userById(1), status: 'COMPLETED' },
  // Milik Hendra — tidak boleh muncul di dashboard Agus.
  { id: 8, ship_id: 4, ship: shipById(4), landing_date: '2026-08-19T07:45:00', pps_officer_id: 1, officer: userById(1), status: 'IN_PROGRESS' },
  { id: 9, ship_id: 5, ship: shipById(5), landing_date: '2026-08-16T06:30:00', pps_officer_id: 4, officer: userById(4), status: 'COMPLETED' },
]

/**
 * crew_id harus milik kapal pada landing terkait.
 * crew_id null = masih di antrian "Tag ABK" milik pemilik kapal.
 */
export const WEIGHING_RECORDS: WeighingRecord[] = [
  // L1 — KM Mina Jaya 01, sedang berjalan (sebagian belum ditag)
  { id: 1, landing_id: 1, scale_id: 1, fish_category_id: 1, weight_kg: 124.5, confidence_score: 95.8, quality_grade: 'Baik', photo_url: null, crew_id: 1, weighed_at: '2026-08-19T08:45:00', is_voided: false },
  { id: 2, landing_id: 1, scale_id: 1, fish_category_id: 3, weight_kg: 86.2, confidence_score: 92.4, quality_grade: 'Sedang', photo_url: null, crew_id: 2, weighed_at: '2026-08-19T09:02:00', is_voided: false },
  { id: 3, landing_id: 1, scale_id: 2, fish_category_id: 2, weight_kg: 210.0, confidence_score: 97.1, quality_grade: 'Baik', photo_url: null, crew_id: null, weighed_at: '2026-08-19T09:20:00', is_voided: false },
  { id: 4, landing_id: 1, scale_id: 1, fish_category_id: 4, weight_kg: 45.75, confidence_score: 88.9, quality_grade: 'Kurang', photo_url: null, crew_id: null, weighed_at: '2026-08-19T09:35:00', is_voided: false },
  { id: 5, landing_id: 1, scale_id: 2, fish_category_id: 1, weight_kg: 98.4, confidence_score: 96.5, quality_grade: 'Baik', photo_url: null, crew_id: 4, weighed_at: '2026-08-19T09:52:00', is_voided: false },
  { id: 6, landing_id: 1, scale_id: 1, fish_category_id: 2, weight_kg: 132.8, confidence_score: 91.2, quality_grade: 'Sedang', photo_url: null, crew_id: null, weighed_at: '2026-08-19T10:08:00', is_voided: false },
  // Salah input, di-void — tidak boleh ikut terhitung di laporan mana pun.
  { id: 7, landing_id: 1, scale_id: 1, fish_category_id: 3, weight_kg: 512.0, confidence_score: 62.3, quality_grade: 'Kurang', photo_url: null, crew_id: null, weighed_at: '2026-08-19T10:15:00', is_voided: true },

  // L2 — KM Samudra Raya, sedang berjalan
  { id: 8, landing_id: 2, scale_id: 2, fish_category_id: 1, weight_kg: 168.3, confidence_score: 96.2, quality_grade: 'Baik', photo_url: null, crew_id: null, weighed_at: '2026-08-19T07:10:00', is_voided: false },
  { id: 9, landing_id: 2, scale_id: 2, fish_category_id: 3, weight_kg: 142.6, confidence_score: 94.7, quality_grade: 'Baik', photo_url: null, crew_id: 6, weighed_at: '2026-08-19T07:28:00', is_voided: false },
  { id: 10, landing_id: 2, scale_id: 1, fish_category_id: 4, weight_kg: 63.9, confidence_score: 89.4, quality_grade: 'Kurang', photo_url: null, crew_id: 7, weighed_at: '2026-08-19T07:45:00', is_voided: false },
  { id: 11, landing_id: 2, scale_id: 2, fish_category_id: 2, weight_kg: 187.2, confidence_score: 93.8, quality_grade: 'Sedang', photo_url: null, crew_id: null, weighed_at: '2026-08-19T08:03:00', is_voided: false },

  // L3 — KM Nelayan Sejahtera, selesai
  { id: 12, landing_id: 3, scale_id: 1, fish_category_id: 3, weight_kg: 302.4, confidence_score: 94.0, quality_grade: 'Baik', photo_url: null, crew_id: 11, weighed_at: '2026-08-18T17:20:00', is_voided: false },
  { id: 13, landing_id: 3, scale_id: 1, fish_category_id: 1, weight_kg: 215.7, confidence_score: 97.6, quality_grade: 'Baik', photo_url: null, crew_id: 12, weighed_at: '2026-08-18T17:38:00', is_voided: false },
  { id: 14, landing_id: 3, scale_id: 2, fish_category_id: 2, weight_kg: 176.3, confidence_score: 90.1, quality_grade: 'Sedang', photo_url: null, crew_id: 13, weighed_at: '2026-08-18T17:55:00', is_voided: false },
  { id: 15, landing_id: 3, scale_id: 1, fish_category_id: 4, weight_kg: 54.2, confidence_score: 87.5, quality_grade: 'Kurang', photo_url: null, crew_id: 14, weighed_at: '2026-08-18T18:12:00', is_voided: false },

  // L4 — KM Mina Jaya 01, selesai
  { id: 16, landing_id: 4, scale_id: 1, fish_category_id: 1, weight_kg: 254.8, confidence_score: 96.9, quality_grade: 'Baik', photo_url: null, crew_id: 1, weighed_at: '2026-08-15T07:40:00', is_voided: false },
  { id: 17, landing_id: 4, scale_id: 2, fish_category_id: 3, weight_kg: 189.5, confidence_score: 95.3, quality_grade: 'Baik', photo_url: null, crew_id: 3, weighed_at: '2026-08-15T07:58:00', is_voided: false },
  { id: 18, landing_id: 4, scale_id: 1, fish_category_id: 2, weight_kg: 143.2, confidence_score: 92.8, quality_grade: 'Sedang', photo_url: null, crew_id: 5, weighed_at: '2026-08-15T08:15:00', is_voided: false },
  { id: 19, landing_id: 4, scale_id: 2, fish_category_id: 4, weight_kg: 71.6, confidence_score: 88.2, quality_grade: 'Kurang', photo_url: null, crew_id: 2, weighed_at: '2026-08-15T08:33:00', is_voided: false },

  // L5 — KM Samudra Raya, selesai
  { id: 20, landing_id: 5, scale_id: 2, fish_category_id: 1, weight_kg: 312.9, confidence_score: 97.4, quality_grade: 'Baik', photo_url: null, crew_id: 8, weighed_at: '2026-08-12T06:10:00', is_voided: false },
  { id: 21, landing_id: 5, scale_id: 1, fish_category_id: 3, weight_kg: 226.4, confidence_score: 94.9, quality_grade: 'Baik', photo_url: null, crew_id: 9, weighed_at: '2026-08-12T06:28:00', is_voided: false },
  { id: 22, landing_id: 5, scale_id: 2, fish_category_id: 2, weight_kg: 158.7, confidence_score: 91.6, quality_grade: 'Sedang', photo_url: null, crew_id: 10, weighed_at: '2026-08-12T06:46:00', is_voided: false },

  // L6 — KM Mina Jaya 01, selesai
  { id: 23, landing_id: 6, scale_id: 1, fish_category_id: 2, weight_kg: 198.3, confidence_score: 93.1, quality_grade: 'Sedang', photo_url: null, crew_id: 4, weighed_at: '2026-08-08T09:25:00', is_voided: false },
  { id: 24, landing_id: 6, scale_id: 2, fish_category_id: 1, weight_kg: 167.9, confidence_score: 96.0, quality_grade: 'Baik', photo_url: null, crew_id: 5, weighed_at: '2026-08-08T09:43:00', is_voided: false },
  { id: 25, landing_id: 6, scale_id: 1, fish_category_id: 3, weight_kg: 134.5, confidence_score: 95.7, quality_grade: 'Baik', photo_url: null, crew_id: 3, weighed_at: '2026-08-08T10:01:00', is_voided: false },

  // L7 — KM Nelayan Sejahtera, selesai
  { id: 26, landing_id: 7, scale_id: 1, fish_category_id: 1, weight_kg: 221.6, confidence_score: 96.8, quality_grade: 'Baik', photo_url: null, crew_id: 11, weighed_at: '2026-08-05T15:48:00', is_voided: false },
  { id: 27, landing_id: 7, scale_id: 2, fish_category_id: 4, weight_kg: 88.3, confidence_score: 89.9, quality_grade: 'Kurang', photo_url: null, crew_id: 14, weighed_at: '2026-08-05T16:06:00', is_voided: false },

  // L8 — KM Bahari Indah (Hendra), sedang berjalan
  { id: 28, landing_id: 8, scale_id: 1, fish_category_id: 1, weight_kg: 143.7, confidence_score: 95.1, quality_grade: 'Baik', photo_url: null, crew_id: 15, weighed_at: '2026-08-19T08:00:00', is_voided: false },
  { id: 29, landing_id: 8, scale_id: 2, fish_category_id: 3, weight_kg: 97.2, confidence_score: 93.4, quality_grade: 'Sedang', photo_url: null, crew_id: null, weighed_at: '2026-08-19T08:18:00', is_voided: false },

  // L9 — KM Cakrawala 07 (Hendra), selesai
  { id: 30, landing_id: 9, scale_id: 2, fish_category_id: 2, weight_kg: 264.1, confidence_score: 94.3, quality_grade: 'Baik', photo_url: null, crew_id: 18, weighed_at: '2026-08-16T06:50:00', is_voided: false },
  { id: 31, landing_id: 9, scale_id: 1, fish_category_id: 4, weight_kg: 79.8, confidence_score: 90.6, quality_grade: 'Sedang', photo_url: null, crew_id: 19, weighed_at: '2026-08-16T07:08:00', is_voided: false },
]
