'use client'

import React, { useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { QrCode, Printer, Download } from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDialogProps {
  bookingUrl: string
  salonName: string
}

export default function QRCodeDialog({ bookingUrl, salonName }: QRCodeDialogProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null)

  // Fonction pour imprimer le QR code
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression')
      return
    }

    const qrCodeElement = qrCodeRef.current
    if (!qrCodeElement) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${salonName}</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .print-container {
              text-align: center;
              max-width: 600px;
            }
            .qr-code {
              margin: 30px 0;
            }
            h1 {
              color: #1e293b;
              font-size: 32px;
              margin-bottom: 10px;
            }
            p {
              color: #64748b;
              font-size: 18px;
              margin-bottom: 20px;
            }
            .instructions {
              margin-top: 30px;
              padding: 20px;
              background: #f1f5f9;
              border-radius: 8px;
            }
            .instructions h3 {
              color: #1e293b;
              font-size: 20px;
              margin-bottom: 15px;
            }
            .instructions ol {
              text-align: left;
              color: #475569;
              font-size: 16px;
              line-height: 1.8;
            }
            .footer {
              margin-top: 40px;
              color: #94a3b8;
              font-size: 14px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>${salonName}</h1>
            <p>Scannez pour réserver en ligne</p>
            <div class="qr-code">
              ${qrCodeElement.innerHTML}
            </div>
            <div class="instructions">
              <h3>Comment réserver ?</h3>
              <ol>
                <li>Scannez le QR code avec votre smartphone</li>
                <li>Choisissez votre service préféré</li>
                <li>Sélectionnez un coiffeur et un créneau</li>
                <li>Confirmez votre réservation</li>
              </ol>
            </div>
            <div class="footer">
              <p>Propulsé par Zyra • Réservation en ligne 24h/24</p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  // Fonction pour télécharger le QR code
  const handleDownload = () => {
    const svg = qrCodeRef.current?.querySelector('svg')
    if (!svg) {
      toast.error('Impossible de télécharger le QR code')
      return
    }

    // Cloner le SVG pour la conversion
    const svgClone = svg.cloneNode(true) as SVGElement
    const svgData = new XMLSerializer().serializeToString(svgClone)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    // Taille haute résolution
    canvas.width = 1000
    canvas.height = 1000

    img.onload = () => {
      if (ctx) {
        // Fond blanc
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `qrcode-${salonName.toLowerCase().replace(/\s+/g, '-')}.png`
            link.click()
            URL.revokeObjectURL(url)
            toast.success('QR code téléchargé!')
          }
        })
      }
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="h-4 w-4" />
          Voir le QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">QR Code de réservation</DialogTitle>
          <DialogDescription>
            Partagez ce QR code avec vos clients pour qu'ils puissent réserver facilement en ligne
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* QR Code Container */}
          <div 
            ref={qrCodeRef}
            className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-blue-200"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <QRCodeSVG
                value={bookingUrl}
                size={300}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232563eb' rx='15'/%3E%3Ctext x='50' y='65' font-family='Arial,sans-serif' font-size='35' font-weight='bold' fill='white' text-anchor='middle'%3EZYRA%3C/text%3E%3C/svg%3E",
                  height: 60,
                  width: 60,
                  excavate: true,
                }}
              />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-gray-700">{salonName}</p>
              <p className="text-xs text-gray-500 mt-1">Scannez pour réserver</p>
            </div>
          </div>

          {/* URL Display */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Lien de réservation</p>
            <p className="text-sm text-gray-700 break-all font-mono">{bookingUrl}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Comment utiliser ce QR code ?</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Affichez-le dans votre salon (vitrine, comptoir, miroirs)</li>
              <li>Imprimez-le sur vos cartes de visite</li>
              <li>Partagez-le sur vos réseaux sociaux</li>
              <li>Ajoutez-le à vos supports marketing</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
