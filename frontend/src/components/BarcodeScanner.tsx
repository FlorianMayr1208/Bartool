import { useEffect, useRef } from 'react'
import Quagga from 'quagga'

export default function BarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    Quagga.init(
      {
        inputStream: { type: 'LiveStream', target: ref.current },
        decoder: { readers: ['ean_reader'] }
      },
      (err) => {
        if (err) {
          console.error(err)
          return
        }
        Quagga.start()
      }
    )
    Quagga.onDetected((res) => {
      onDetected(res.codeResult.code)
      Quagga.stop()
    })
    return () => {
      Quagga.stop()
      Quagga.offDetected()
    }
  }, [onDetected])

  return <div ref={ref} className="w-full h-48 bg-gray-200" />
}
