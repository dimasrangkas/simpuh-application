import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  createWeighingDevice,
  type DeviceStatus,
  type ScaleReading,
} from '@/services/weighing-device'

/**
 * Binding React ke `WeighingDeviceService`.
 * Komponen cukup memakai hook ini dan tidak pernah menyentuh protokol apa pun.
 */
export function useWeighingDevice(scaleId: number | null, uniqueScaleId: string | null) {
  const device = useMemo(() => createWeighingDevice(), [])
  const [reading, setReading] = useState<ScaleReading | null>(null)
  const [status, setStatus] = useState<DeviceStatus>(() => device.getStatus())

  // Pembacaan stabil terakhir disimpan sebagai state, bukan ref: nilainya ikut
  // menentukan apakah tombol Simpan aktif, jadi perubahannya harus memicu render.
  // Ini juga yang membuat berat tidak hilang saat koneksi putus di tengah proses.
  const [lastStable, setLastStable] = useState<ScaleReading | null>(null)

  useEffect(() => {
    const offStatus = device.onStatusChange(setStatus)
    const offReading = device.subscribe((r) => {
      setReading(r)
      if (r.is_stable) setLastStable(r)
    })
    return () => {
      offStatus()
      offReading()
    }
  }, [device])

  useEffect(() => {
    if (scaleId == null || !uniqueScaleId) {
      device.disconnect()
      return
    }
    void device.connect(scaleId, uniqueScaleId)
    return () => device.disconnect()
  }, [device, scaleId, uniqueScaleId])

  const tare = useCallback(async () => {
    await device.tare()
    setLastStable(null)
    setReading(null)
  }, [device])

  const reconnect = useCallback(() => {
    if (scaleId == null || !uniqueScaleId) return
    void device.connect(scaleId, uniqueScaleId)
  }, [device, scaleId, uniqueScaleId])

  return {
    reading,
    status,
    lastStable,
    transport: device.transport,
    isConnected: status.state === 'connected',
    tare,
    reconnect,
  }
}
