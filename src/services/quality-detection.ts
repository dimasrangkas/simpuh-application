/**
 * Lapisan abstraksi "penyedia deteksi kualitas".
 *
 * Modul AI-nya BELUM ADA — ke depan akan memakai kamera IoT yang mendeteksi
 * jenis & kondisi hasil tangkapan secara otomatis saat ikan ditimbang.
 * Untuk sekarang dipakai implementasi mock. UI (Penimbangan & Scan Morfologi)
 * hanya bergantung pada interface di bawah, sehingga penggantian ke model AI
 * asli tidak menyentuh satu baris pun kode halaman.
 */

import { FISH_CATEGORIES } from '@/data/mock'

export type QualityGrade = 'Baik' | 'Sedang' | 'Kurang'

export interface DetectionInput {
  /** Foto hasil capture; null bila sumbernya kamera IoT otomatis. */
  image?: Blob | null
  scaleId?: number
  landingId?: number
}

export interface DetectionResult {
  detected_category: string
  /** 0–100 */
  confidence_score: number
  quality_grade: QualityGrade
  /** Estimasi panjang ikan (cm) — hasil analisa morfologi */
  estimated_length_cm: number
  processing_time_ms: number
  detected_at: string
  /** Sumber deteksi, ditampilkan apa adanya di UI. */
  source: string
}

export interface QualityDetectionProvider {
  readonly name: string
  /** false selama modul AI asli belum terpasang — UI memberi label "simulasi". */
  readonly isLive: boolean
  detect(input: DetectionInput): Promise<DetectionResult>
}

/** Implementasi simulasi — meniru latensi & keluaran model sungguhan. */
export class MockQualityDetectionProvider implements QualityDetectionProvider {
  readonly name = 'Simulasi AI (mock)'
  readonly isLive = false

  async detect(_input: DetectionInput): Promise<DetectionResult> {
    const processingTime = 1500 + Math.random() * 1000
    await new Promise((r) => setTimeout(r, processingTime))

    const pool = FISH_CATEGORIES.slice(0, 3)
    const picked = pool[Math.floor(Math.random() * pool.length)]
    const confidence = Number((85 + Math.random() * 15).toFixed(2))

    return {
      detected_category: picked.category_name,
      confidence_score: confidence,
      quality_grade: confidence >= 95 ? 'Baik' : confidence >= 90 ? 'Sedang' : 'Kurang',
      estimated_length_cm: Number((25 + Math.random() * 40).toFixed(1)),
      processing_time_ms: Math.round(processingTime),
      detected_at: new Date().toISOString(),
      source: this.name,
    }
  }
}

/**
 * Titik tukar implementasi — nanti tinggal tambah
 * `case 'iot-camera': return new IotCameraDetectionProvider(...)`.
 */
export function createQualityDetectionProvider(): QualityDetectionProvider {
  const provider = import.meta.env.VITE_DETECTION_PROVIDER ?? 'mock'
  switch (provider) {
    // case 'iot-camera': return new IotCameraDetectionProvider(...)
    case 'mock':
    default:
      return new MockQualityDetectionProvider()
  }
}
