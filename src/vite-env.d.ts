/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCALE_TRANSPORT?: string
  readonly VITE_DETECTION_PROVIDER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
