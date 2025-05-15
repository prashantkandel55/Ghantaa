"use client"

import { useEffect, useRef } from "react"
import QRCodeStyling from "qr-code-styling"
import { Card } from "@/components/ui/card"

interface QRCodeProps {
  url: string
  size?: number
  logo?: string
  title?: string
}

export function QRCode({ url, size = 200, logo, title }: QRCodeProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      type: "svg",
      data: url,
      image: logo,
      dotsOptions: {
        color: "#1e293b",
        type: "rounded",
      },
      cornersSquareOptions: {
        color: "#1e293b",
        type: "extra-rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
      },
    })

    // Clear previous QR code
    if (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild)
    }

    qrCode.append(ref.current)
  }, [url, size, logo])

  return (
    <Card className="p-4 flex flex-col items-center gap-3 bg-white">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      <div ref={ref} className="flex justify-center" />
      <p className="text-sm text-center text-slate-600 break-all px-2">{url}</p>
    </Card>
  )
}
