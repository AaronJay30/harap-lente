"use client"

import { useState, useEffect } from "react"
import { Users, Camera, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface SessionPageProps {
  params: {
    id: string
  }
}

export default function SessionPage({ params }: SessionPageProps) {
  const [participants, setParticipants] = useState<string[]>(["You"])
  const [sessionStatus, setSessionStatus] = useState<"waiting" | "active" | "completed">("waiting")

  useEffect(() => {
    // Simulate participants joining
    const timer = setTimeout(() => {
      setParticipants(["You", "Friend 1", "Friend 2"])
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header with Logo */}
      <div className="bg-amber-900 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/images/harap-lente-navbar.png"
              alt="Harap Lente"
              width={120}
              height={60}
              className="h-8 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold tracking-wide">Session {params.id}</h1>
              <p className="text-amber-200 text-sm">Collaborative Photobooth</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white text-amber-900">
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </Badge>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-white text-white hover:bg-white hover:text-amber-900"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Participants Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Users className="mr-2 h-5 w-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <span className="font-medium text-amber-900">{participant}</span>
                    <Badge variant="outline" className="border-amber-400 text-amber-700">
                      {index === 0 ? "Host" : "Joined"}
                    </Badge>
                  </div>
                ))}
              </div>

              {participants.length < 4 && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-dashed border-amber-300 text-center">
                  <p className="text-amber-700">Waiting for more friends to join...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Camera className="mr-2 h-5 w-5" />
                Session Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionStatus === "waiting" && (
                <>
                  <p className="text-amber-700">
                    Share the session link with your friends and start taking photos together!
                  </p>
                  <Button
                    className="w-full bg-amber-800 hover:bg-amber-700 text-white py-3 font-medium tracking-wide shadow-lg"
                    disabled={participants.length < 2}
                  >
                    Start Photo Session
                  </Button>
                  {participants.length < 2 && (
                    <p className="text-sm text-amber-600 text-center">Need at least 2 participants to start</p>
                  )}
                </>
              )}

              {sessionStatus === "active" && (
                <div className="text-center">
                  <p className="text-amber-700 mb-4">Session is active!</p>
                  <div className="space-y-2">
                    <Button className="w-full bg-amber-800 hover:bg-amber-700 text-white">Take Photo</Button>
                    <Button variant="outline" className="w-full border-amber-600 text-amber-800 bg-transparent">
                      View Gallery
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-amber-900 mb-3">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-amber-700">
              <li>Share the session link with your friends</li>
              <li>Wait for everyone to join the session</li>
              <li>Choose a template together</li>
              <li>Take turns or take photos simultaneously</li>
              <li>Download your collaborative photo strip!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
