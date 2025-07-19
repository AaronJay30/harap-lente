"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Camera, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void
  capturedCount: number
  totalRequired: number
  templateId: string
}

export function CameraCapture({ onPhotoCapture, capturedCount, totalRequired, templateId }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flashActive, setFlashActive] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL("image/png")
    onPhotoCapture(dataUrl)
  }, [onPhotoCapture])

  const handleCaptureClick = () => {
    setIsCapturing(true)
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          // Flash effect
          setFlashActive(true)
          setTimeout(() => setFlashActive(false), 200)
          // Capture photo
          setTimeout(() => {
            capturePhoto()
            setIsCapturing(false)
            setCountdown(null)
          }, 100)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="py-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-amber-900 mb-2">
          Photo {capturedCount + 1} of {totalRequired}
        </h2>
        <p className="text-amber-700">Get ready for your vintage moment!</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0 relative">
            {/* Flash overlay */}
            {flashActive && <div className="absolute inset-0 bg-white z-20 opacity-80"></div>}

            {/* Countdown overlay */}
            {countdown && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-white text-8xl font-bold animate-pulse">{countdown}</div>
              </div>
            )}

            <div className="aspect-[4/3] bg-gray-900 flex items-center justify-center relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {/* Vintage frame overlay */}
              <div className="absolute inset-0 border-8 border-amber-200 opacity-30 pointer-events-none"></div>
              <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-amber-300 opacity-20 pointer-events-none"></div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button
            onClick={handleCaptureClick}
            disabled={isCapturing || !stream}
            className="bg-amber-800 hover:bg-amber-700 text-white px-8 py-4 text-xl font-medium tracking-wide shadow-lg disabled:opacity-50"
          >
            {isCapturing ? (
              <>
                <Zap className="mr-3 h-6 w-6 animate-pulse" />
                Get Ready...
              </>
            ) : (
              <>
                <Camera className="mr-3 h-6 w-6" />
                Capture Photo
              </>
            )}
          </Button>

          {capturedCount > 0 && (
            <p className="text-amber-700">
              {totalRequired - capturedCount} more photo{totalRequired - capturedCount !== 1 ? "s" : ""} to go!
            </p>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
