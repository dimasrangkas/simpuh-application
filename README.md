# SIMPUH — Sistem Mutu & Penimbangan Hasil Laut

Aplikasi web internal **PPS Cilacap** (Pelabuhan Perikanan Samudera Cilacap),
Kementerian Kelautan & Perikanan.

Mendigitalisasi alur pendaratan kapal ikan: penimbangan lewat timbangan IoT →
verifikasi kualitas/spesies → alokasi hasil tangkapan ke ABK via tag warna →
transaksi pembelian → estimasi PNBP & pelaporan.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** + komponen bergaya **shadcn/ui** (Radix primitives)
- **lucide-react** (ikon), **sonner** (notifikasi)
- Navigasi berbasis state (tanpa router) — mengikuti arsitektur prototype

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build produksi ke dist/
npm run preview  # cek hasil build
npm run lint
```

### Akun demo

| Email | Peran |
|---|---|
| `admin@pps.kkp.go.id` | Admin (bisa switch ke semua peran) |
| `budi@pps.kkp.go.id` | Petugas PPS (+ Pemilik Kapal) |
| `agus@kapal.com` | Pemilik Kapal |
| `buyer@majujaya.com` | Pembeli |

Kata sandi semua akun: `simpuh123`

## Struktur

```
src/
├── auth/
│   ├── permissions.ts     # sumber kebenaran tunggal: menu + hak akses per role
│   └── auth-context.tsx   # login, sesi, role switcher
├── services/              # ← lapisan abstraksi (lihat di bawah)
│   ├── weighing-device.ts
│   └── quality-detection.ts
├── hooks/use-weighing-device.ts
├── store/app-store.tsx    # state terpusat, signature menyerupai endpoint API
├── data/
│   ├── mock.ts            # data contoh
│   └── config.ts          # formula PNBP & biaya penanganan
├── lib/                   # format (Rupiah, Kg, tanggal id-ID), export CSV/PDF
├── components/ui/         # primitive shadcn-style
├── components/layout/     # sidebar + header + role switcher
└── pages/{pps,owner,buyer,admin}/
```

## Dua titik integrasi yang sengaja diisolasi

Keduanya masih **mock**, tapi UI sudah final — penggantian ke implementasi asli
tidak menyentuh satu baris pun kode halaman.

### 1. Timbangan IoT — `src/services/weighing-device.ts`

Merk/protokol perangkat belum ditentukan, jadi integrasinya dibangun
**protokol-agnostik**. Halaman Penimbangan hanya bicara ke interface
`WeighingDeviceService`.

```ts
interface WeighingDeviceService {
  readonly transport: string
  connect(scaleId, uniqueScaleId): Promise<void>
  disconnect(): void
  tare(): Promise<void>
  subscribe(listener: (r: ScaleReading) => void): Unsubscribe
  onStatusChange(listener: (s: DeviceStatus) => void): Unsubscribe
  getStatus(): DeviceStatus
}
```

`MockWeighingDevice` mengirim pembacaan tiap detik dan **sesekali menjatuhkan
koneksi** supaya penanganan alat offline benar-benar teruji (status
`reconnecting`, tombol sambung ulang, berat stabil terakhir tetap tersimpan).

Begitu perangkat dipilih: tambah implementasi baru (MQTT / WebSocket /
serial-to-web bridge / REST polling), daftarkan di `createWeighingDevice()`,
set `VITE_SCALE_TRANSPORT`. Selesai.

### 2. Deteksi kualitas/spesies — `src/services/quality-detection.ts`

Modul AI **belum ada**. Ke depan memakai kamera IoT yang mendeteksi otomatis
saat ikan ditimbang, tanpa scan manual.

```ts
interface QualityDetectionProvider {
  readonly name: string
  readonly isLive: boolean   // false → UI menampilkan label "mode simulasi"
  detect(input: DetectionInput): Promise<DetectionResult>
}
```

Ganti ke implementasi kamera IoT lewat `createQualityDetectionProvider()` +
`VITE_DETECTION_PROVIDER`.

## Formula PNBP

Ada di **satu fungsi terpusat**: `calculatePNBP()` di `src/data/config.ts`.
Dipakai dashboard, laporan, dan invoice. Dua metode tersedia dan bisa diganti
lewat halaman Pengaturan:

- `per_kg_rate` — berat × tarif per Kg per kategori *(aktif, versi demo)*
- `percent_of_value` — persentase dari nilai transaksi

Formula resmi menyusul; perubahan cukup di fungsi ini.

## Hak akses (RBAC)

`src/auth/permissions.ts` adalah sumber kebenaran tunggal untuk menu **dan**
guard halaman. Role switcher di kanan atas dipertahankan sebagai cara berpindah
context **setelah login** — bukan penggantinya (satu perangkat lapangan dipakai
bergantian, satu akun bisa punya beberapa peran).

> ⚠️ Penegakan role di klien hanya untuk kenyamanan tampilan. Saat backend
> terpasang, setiap request **wajib** divalidasi ulang di server.

## Status data

Semua data masih in-memory di atas `src/data/mock.ts`. Action di
`src/store/app-store.tsx` sudah disusun menyerupai endpoint REST
(`createInvoice`, `saveShip`, `assignCrewTag`, …), jadi migrasi ke API
sungguhan tinggal mengganti isi provider tanpa menyentuh komponen.

## Deploy

Vercel auto-detect Vite. `vercel.json` sudah menyertakan SPA rewrite.

```bash
vercel
```
