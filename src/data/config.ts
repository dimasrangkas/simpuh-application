/**
 * Konfigurasi yang bisa diubah lewat halaman Pengaturan (Admin).
 * Formula PNBP sengaja ditaruh di sini — versi resminya kemungkinan direvisi,
 * dan penggantiannya cukup di satu berkas ini.
 */

export interface AppConfig {
  /** Biaya penanganan, persentase dari subtotal transaksi. */
  handling_fee_percent: number
  /** Metode perhitungan PNBP yang sedang aktif. */
  pnbp_method: 'per_kg_rate' | 'percent_of_value'
  /** Dipakai bila metode = percent_of_value. */
  pnbp_percent: number
  organization_name: string
  organization_subtitle: string
}

export const DEFAULT_CONFIG: AppConfig = {
  handling_fee_percent: 2.5,
  // Fase demo: pakai tarif per Kg per kategori (fish_categories.pnbp_rate).
  pnbp_method: 'per_kg_rate',
  pnbp_percent: 1.5,
  organization_name: 'PPS Cilacap',
  organization_subtitle: 'Kementerian Kelautan & Perikanan',
}

/**
 * Satu-satunya tempat PNBP dihitung. Formula resmi menyusul —
 * cukup ubah fungsi ini tanpa menyentuh halaman mana pun.
 */
export function calculatePNBP(
  input: { weight_kg: number; pnbp_rate: number; transaction_value?: number },
  config: AppConfig = DEFAULT_CONFIG,
): number {
  if (config.pnbp_method === 'percent_of_value') {
    return ((input.transaction_value ?? 0) * config.pnbp_percent) / 100
  }
  return input.weight_kg * input.pnbp_rate
}

export function calculateHandlingFee(subtotal: number, config: AppConfig = DEFAULT_CONFIG) {
  return (subtotal * config.handling_fee_percent) / 100
}
