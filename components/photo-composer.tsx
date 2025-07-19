"use client"

import { useState, useRef, useEffect } from "react"
import { Download, Share2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PhotoComposerProps {
  photos: string[]
  templateId: string
  subTemplateId: string
  onCompositeReady: (compositeDataUrl: string) => void
}

export function PhotoComposer({ photos, templateId, subTemplateId, onCompositeReady }: PhotoComposerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [compositeImage, setCompositeImage] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateComposite = async () => {
    if (!canvasRef.current || photos.length === 0) return

    setIsGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions for photo strip (adjust based on template)
    const stripWidth = 400
    const stripHeight = templateId.includes("1x4")
      ? 1200
      : templateId.includes("1x3")
        ? 900
        : templateId.includes("1x2")
          ? 600
          : 300

    canvas.width = stripWidth
    canvas.height = stripHeight

    // Apply different styles based on subTemplateId
    let backgroundColor = "#fef3c7"
    let borderColor = "#92400e"

    if (subTemplateId.includes("vintage")) {
      backgroundColor = "#f3e8d0"
      borderColor = "#8b4513"
    } else if (subTemplateId.includes("modern")) {
      backgroundColor = "#ffffff"
      borderColor = "#6b7280"
    } else if (subTemplateId.includes("retro")) {
      backgroundColor = "#fef3c7"
      borderColor = "#dc2626"
    }

    // Create vintage background
    const gradient = ctx.createLinearGradient(0, 0, 0, stripHeight)
    gradient.addColorStop(0, backgroundColor)
    gradient.addColorStop(1, "#fed7aa")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, stripWidth, stripHeight)

    // Add vintage border
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, stripWidth - 8, stripHeight - 8)

    // Calculate photo dimensions and positions
    const photoHeight = (stripHeight - 80) / photos.length
    const photoWidth = stripWidth - 60
    const photoStartX = 30
    let photoStartY = 40

    // Load and draw each photo
    for (let i = 0; i < photos.length; i++) {
      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve) => {
        img.onload = () => {
          // Draw photo with vintage effect
          ctx.save()

          // Add slight sepia tone
          ctx.filter = "sepia(0.3) contrast(1.1) brightness(0.95)"

          // Draw the photo
          ctx.drawImage(img, photoStartX, photoStartY, photoWidth, photoHeight - 20)

          // Add photo border
          ctx.filter = "none"
          ctx.strokeStyle = "#78350f"
          ctx.lineWidth = 2
          ctx.strokeRect(photoStartX, photoStartY, photoWidth, photoHeight - 20)

          ctx.restore()
          photoStartY += photoHeight
          resolve(null)
        }
        img.src = photos[i]
      })
    }

    // Add vintage text/branding
    ctx.fillStyle = "#92400e"
    ctx.font = "bold 16px serif"
    ctx.textAlign = "center"
    ctx.fillText("HARAP LENTE", stripWidth / 2, stripHeight - 15)

    const dataUrl = canvas.toDataURL("image/png")
    setCompositeImage(dataUrl)
    onCompositeReady(dataUrl)
    setIsGenerating(false)
  }

  useEffect(() => {
    generateComposite()
  }, [photos, templateId, subTemplateId])

  const downloadImage = () => {
    if (!compositeImage) return

    const link = document.createElement("a")
    link.download = `harap-lente-${Date.now()}.png`
    link.href = compositeImage
    link.click()
  }

  const shareImage = async () => {
    if (!compositeImage) return

    try {
      const response = await fetch(compositeImage)
      const blob = await response.blob()
      const file = new File([blob], "harap-lente-photo.png", { type: "image/png" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Harap Lente Photo",
          files: [file],
        })
      } else {
        // Fallback: copy to clipboard or download
        downloadImage()
      }
    } catch (error) {
      console.error("Error sharing:", error)
      downloadImage()
    }
  }

  return (
    <div className="py-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-amber-900 mb-2">Your Vintage Photo Strip</h2>
        <p className="text-amber-700">Ready to download and share!</p>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-4">
            {isGenerating ? (
              <div className="aspect-[1/3] bg-amber-100 flex items-center justify-center">
                <div className="text-amber-600">
                  <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Creating your vintage masterpiece...</p>
                </div>
              </div>
            ) : compositeImage ? (
              <img
                src={compositeImage || "/placeholder.svg"}
                alt="Vintage photo strip"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="aspect-[1/3] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Generating photo strip...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={downloadImage}
            disabled={!compositeImage}
            className="flex-1 bg-amber-800 hover:bg-amber-700 text-white py-3 font-medium tracking-wide shadow-lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download PNG
          </Button>

          <Button
            onClick={shareImage}
            disabled={!compositeImage}
            variant="outline"
            className="flex-1 border-amber-600 text-amber-800 hover:bg-amber-50 py-3 font-medium tracking-wide bg-transparent"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
