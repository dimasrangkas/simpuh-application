/**
 * Lapisan abstraksi perangkat timbangan IoT.
 *
 * Halaman Penimbangan HANYA berbicara ke interface `WeighingDeviceService`
 * dan tidak pernah tahu protokol yang dipakai di baliknya. Begitu merk/protokol
 * timbangan ditentukan, cukup tambah implementasi baru (MQTT / WebSocket /
 * serial-to-web bridge / REST polling) lalu daftarkan di `createWeighingDevice()`
 * — tidak ada satu pun komponen UI yang perlu diubah.
 */

export interface ScaleReading {
  scale_id: number
  unique_scale_id: string
  weight_kg: number
  /** true bila pembacaan sudah stabil dan layak disimpan */
  is_stable: boolean
  battery_level: number
  temperature_celsius: number
  reading_timestamp: string
}

export type DeviceConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export interface DeviceStatus {
  state: DeviceConnectionState
  /** Pesan siap-tampil dalam Bahasa Indonesia */
  message: string
  since: string
}

export type Unsubscribe = () => void

export interface WeighingDeviceService {
  /** Nama transport, ditampilkan di UI diagnostik. */
  readonly transport: string
  connect(scaleId: number, uniqueScaleId: string): Promise<void>
  disconnect(): void
  /** Nol-kan timbangan. */
  tare(): Promise<void>
  subscribe(listener: (reading: ScaleReading) => void): Unsubscribe
  onStatusChange(listener: (status: DeviceStatus) => void): Unsubscribe
  getStatus(): DeviceStatus
}

const STATUS_MESSAGE: Record<DeviceConnectionState, string> = {
  disconnected: 'Terputus',
  connecting: 'Menghubungkan…',
  connected: 'Terhubung',
  reconnecting: 'Menyambung ulang…',
  error: 'Gagal terhubung',
}

/** Basis umum: manajemen listener & status, dipakai semua implementasi. */
abstract class BaseWeighingDevice implements WeighingDeviceService {
  abstract readonly transport: string

  private readingListeners = new Set<(r: ScaleReading) => void>()
  private statusListeners = new Set<(s: DeviceStatus) => void>()
  private status: DeviceStatus = {
    state: 'disconnected',
    message: STATUS_MESSAGE.disconnected,
    since: new Date().toISOString(),
  }

  abstract connect(scaleId: number, uniqueScaleId: string): Promise<void>
  abstract disconnect(): void
  abstract tare(): Promise<void>

  subscribe(listener: (reading: ScaleReading) => void): Unsubscribe {
    this.readingListeners.add(listener)
    return () => this.readingListeners.delete(listener)
  }

  onStatusChange(listener: (status: DeviceStatus) => void): Unsubscribe {
    this.statusListeners.add(listener)
    listener(this.status)
    return () => this.statusListeners.delete(listener)
  }

  getStatus() {
    return this.status
  }

  protected emitReading(reading: ScaleReading) {
    this.readingListeners.forEach((l) => l(reading))
  }

  protected setStatus(state: DeviceConnectionState, message?: string) {
    this.status = {
      state,
      message: message ?? STATUS_MESSAGE[state],
      since: new Date().toISOString(),
    }
    this.statusListeners.forEach((l) => l(this.status))
  }
}

/**
 * Implementasi simulasi untuk pengembangan & demo.
 * Mengirim pembacaan tiap `intervalMs`, dan sesekali menjatuhkan koneksi
 * supaya penanganan alat offline di UI benar-benar teruji.
 */
export class MockWeighingDevice extends BaseWeighingDevice {
  readonly transport = 'Simulasi (mock)'

  private timer: ReturnType<typeof setInterval> | null = null
  private dropoutTimer: ReturnType<typeof setTimeout> | null = null
  private current = 0
  private scaleId = 0
  private uniqueScaleId = ''

  private readonly options: {
    intervalMs?: number
    /** Peluang koneksi terputus tiap pembacaan (0–1). 0 = tidak pernah. */
    dropoutChance?: number
  }

  constructor(options: { intervalMs?: number; dropoutChance?: number } = {}) {
    super()
    this.options = options
  }

  async connect(scaleId: number, uniqueScaleId: string) {
    this.scaleId = scaleId
    this.uniqueScaleId = uniqueScaleId
    this.setStatus('connecting')
    await delay(600)
    this.current = 0
    this.setStatus('connected')
    this.startStream()
  }

  disconnect() {
    this.stopStream()
    if (this.dropoutTimer) clearTimeout(this.dropoutTimer)
    this.dropoutTimer = null
    this.setStatus('disconnected')
  }

  async tare() {
    this.current = 0
  }

  private startStream() {
    this.stopStream()
    const interval = this.options.intervalMs ?? 1000
    this.timer = setInterval(() => {
      if (this.maybeDropout()) return
      // Naik bertahap lalu mengendap — meniru ikan dituang ke atas timbangan.
      const drift = (Math.random() - 0.35) * 8
      this.current = Math.max(0, this.current + drift)
      this.emitReading({
        scale_id: this.scaleId,
        unique_scale_id: this.uniqueScaleId,
        weight_kg: Number(this.current.toFixed(2)),
        is_stable: Math.abs(drift) < 1,
        battery_level: 85 + Math.floor(Math.random() * 15),
        temperature_celsius: Number((25 + Math.random() * 5).toFixed(1)),
        reading_timestamp: new Date().toISOString(),
      })
    }, interval)
  }

  private stopStream() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /** Simulasi putus koneksi di tengah proses, lalu menyambung ulang sendiri. */
  private maybeDropout() {
    const chance = this.options.dropoutChance ?? 0
    if (chance <= 0 || Math.random() > chance) return false
    this.stopStream()
    this.setStatus('reconnecting', 'Sinyal timbangan hilang — menyambung ulang…')
    this.dropoutTimer = setTimeout(() => {
      this.setStatus('connected', 'Tersambung kembali')
      this.startStream()
    }, 3000)
    return true
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Titik tukar implementasi. Ganti nilai `VITE_SCALE_TRANSPORT` (atau tambahkan
 * case baru) begitu perangkat fisik sudah dipilih.
 */
export function createWeighingDevice(): WeighingDeviceService {
  const transport = import.meta.env.VITE_SCALE_TRANSPORT ?? 'mock'
  switch (transport) {
    // case 'mqtt':      return new MqttWeighingDevice(...)
    // case 'websocket': return new WebSocketWeighingDevice(...)
    case 'mock':
    default:
      return new MockWeighingDevice({ intervalMs: 1000, dropoutChance: 0.02 })
  }
}
