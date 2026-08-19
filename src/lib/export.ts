/**
 * Export tanpa dependency tambahan.
 * - Excel: CSV dengan BOM UTF-8 + pemisah titik-koma, supaya Excel locale ID
 *   membuka file langsung dalam kolom yang benar.
 * - PDF: memakai dialog cetak browser (Simpan sebagai PDF).
 */

export type ExportColumn<T> = {
  header: string
  value: (row: T) => string | number
}

export function exportToCsv<T>(filename: string, columns: ExportColumn<T>[], rows: T[]) {
  const escape = (value: string | number) => {
    const text = String(value ?? '')
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const lines = [
    columns.map((c) => escape(c.header)).join(';'),
    ...rows.map((row) => columns.map((c) => escape(c.value(row))).join(';')),
  ]

  // BOM agar karakter Indonesia terbaca benar di Excel.
  const blob = new Blob(['﻿' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToPdf() {
  window.print()
}
