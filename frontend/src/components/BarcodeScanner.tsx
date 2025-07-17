import { useEffect } from 'react'
import {
  Html5QrcodeScanner,
  Html5QrcodeSupportedFormats
} from 'html5-qrcode'

export default function BarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'barcode-scanner',
      {
        fps: 10,
        qrbox: { width: 300, height: 150 },
        formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
        useBarCodeDetectorIfSupported: true
      },
      false
    )

    scanner.render(
      (text) => {
        onDetected(text)
        scanner.clear().catch(() => {})
      },
      undefined
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [onDetected])

  return <div id="barcode-scanner" className="relative w-full h-48" />
}
