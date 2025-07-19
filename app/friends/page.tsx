"use client"

import { useState } from "react"
import { Users, LinkIcon, Copy, Check, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

export default function FriendsPage() {
  const [sessionId, setSessionId] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  const createSession = async () => {
    setIsCreating(true)
    // Simulate session creation
    const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase()
    setTimeout(() => {
      setSessionId(newSessionId)
      setIsCreating(false)
    }, 1000)
  }

  const copySessionLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
              <h1 className="text-xl font-bold tracking-wide">Friends Session</h1>
              <p className="text-amber-200 text-sm">Group Photobooth Experience</p>
            </div>
          </div>
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

      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <Users className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-amber-900 mb-2">Photo Session with Friends</h2>
          <p className="text-amber-700">Create a shared session and invite your friends to join the fun!</p>
        </div>

        {!sessionId ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-amber-900">Start a New Session</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-amber-700 mb-6">
                Create a shared photobooth session that your friends can join from anywhere.
              </p>
              <Button
                onClick={createSession}
                disabled={isCreating}
                className="bg-amber-800 hover:bg-amber-700 text-white px-8 py-3 text-lg font-medium tracking-wide shadow-lg"
              >
                {isCreating ? "Creating Session..." : "Create Session"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-amber-900">Session Created!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-amber-700 mb-4">Your session ID is:</p>
                <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
                  <code className="text-2xl font-bold text-amber-900 tracking-wider">{sessionId}</code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Share this link with your friends:
                </label>
                <div className="flex gap-2">
                  <Input value={`${window.location.origin}/session/${sessionId}`} readOnly className="flex-1" />
                  <Button
                    onClick={copySessionLink}
                    variant="outline"
                    className="border-amber-600 text-amber-800 hover:bg-amber-50 bg-transparent"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <Link href={`/session/${sessionId}`}>
                  <Button className="bg-amber-800 hover:bg-amber-700 text-white px-8 py-3 text-lg font-medium tracking-wide shadow-lg">
                    <LinkIcon className="mr-2 h-5 w-5" />
                    Join Session
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-amber-600">
          <p>Friends sessions are powered by real-time collaboration</p>
        </div>
      </div>
    </div>
  )
}
