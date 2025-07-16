import { useEffect, useRef } from 'react'
import Quagga from 'quagga'

export default function BarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: ref.current,
          constraints: {
            facingMode: 'environment'
          }
        },
        decoder: { readers: ['ean_reader'] },
        locate: true,
        debug: {
          drawBoundingBox: true,
          showCanvas: true,
          showPattern: true
        }
      },
      (err: unknown) => {
        if (err) {
          console.error(err)
          return
        }
        Quagga.start()
        const overlay = Quagga.canvas?.dom?.overlay as HTMLCanvasElement | undefined
        if (overlay) {
          overlay.style.position = 'absolute'
          overlay.style.top = '0'
          overlay.style.left = '0'
          overlay.style.zIndex = '1'
          overlay.style.pointerEvents = 'none'
        }
      }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Quagga.onProcessed((result: any) => {
      const drawingCtx = Quagga.canvas.ctx.overlay;
      const drawingCanvas = Quagga.canvas.dom.overlay;
      // Ensure overlay matches video size
      if (drawingCanvas && drawingCanvas.parentElement) {
        const video = drawingCanvas.parentElement.querySelector('video');
        if (video) {
          drawingCanvas.width = video.videoWidth || 640;
          drawingCanvas.height = video.videoHeight || 192;
        }
      }
      if (result) {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        if (result.boxes) {
            result.boxes
              .filter(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (box: any) => box !== result.box
              )
              .forEach(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (box: any) => {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                color: 'green',
                lineWidth: 2
              });
            });
        }
        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: 'blue',
            lineWidth: 2
          });
        }
        if (result.codeResult && result.codeResult.code && result.line) {
          Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, {
            color: 'red',
            lineWidth: 3
          });
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Quagga.onDetected((res: any) => {
      onDetected(res.codeResult.code)
      Quagga.stop()
    })
    return () => {
      Quagga.stop()
      Quagga.offDetected()
      Quagga.offProcessed()
    }
  }, [onDetected])

  return <div ref={ref} className="relative w-full h-48 bg-gray-200" />
}
