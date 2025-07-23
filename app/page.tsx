"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Camera, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const NOISE_BG =
    "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")";

export default function HomePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showTryLimitModal, setShowTryLimitModal] = useState(false);
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (localStorage.getItem("showTryLimitModal") === "1") {
                setShowTryLimitModal(true);
                localStorage.removeItem("showTryLimitModal");
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
            <Dialog
                open={showTryLimitModal}
                onOpenChange={setShowTryLimitModal}
            >
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-2xl">
                    <div className="flex flex-col items-center justify-center p-8">
                        <div className="bg-amber-100 rounded-full p-4 mb-4 shadow-md">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-amber-500"><path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <DialogHeader className="w-full text-center">
                            <DialogTitle className="text-2xl font-extrabold text-amber-900 mb-2 tracking-wide">Limit Reached</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="text-base text-amber-800 mb-6 mt-2">
                            <span className="block mb-2">You have reached the maximum number of tries.</span>
                            <span className="block mb-2">To access more tries, please contact me on Facebook:</span>
                        </DialogDescription>
                        <a
                            href="https://www.facebook.com/gabato.aaron30"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow transition-all duration-200 mb-2"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="inline-block"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                            facebook.com/gabato.aaron30
                        </a>
                        <span className="text-xs text-gray-500 mt-2">Thank you for your interest!</span>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Vintage grain overlay */}
            <div
                className="absolute inset-0 opacity-20 animate-pulse"
                style={{
                    backgroundImage: NOISE_BG,
                    backgroundRepeat: "repeat",
                }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
                {/* Floating Logo Title */}
                <div className="text-center mb-8 md:mb-12">
                    {/* Main Logo with Floating Animation */}
                    <div className="mb-6 md:mb-8 animate-float">
                        <Image
                            src="/images/harap-lente-title.png"
                            alt="Harap Lente"
                            width={800}
                            height={400}
                            className="mx-auto w-64 md:w-80 lg:w-[42rem] mb-0 lg:-mb-14 h-auto filter drop-shadow-2xl"
                            priority
                        />
                    </div>

                    <div className="relative">
                        <p className="text-base md:text-xl lg:text-2xl text-amber-700 font-light tracking-[0.1em] md:tracking-[0.15em] uppercase">
                            Est. 2025 • Vintage Photobooth Experience
                        </p>
                        <div className="absolute -top-5 md:-top-5 -right-2 md:-right-4 text-amber-600 text-xs md:text-sm rotate-12 font-bold animate-pulse">
                            ★ RETRO ★
                        </div>
                    </div>

                    <div className="flex items-center justify-center mt-4 md:mt-6 space-x-2">
                        <div className="w-6 md:w-8 h-1 bg-amber-600 rounded-full"></div>
                        <div className="w-3 md:w-4 h-1 bg-amber-500 rounded-full"></div>
                        <div className="w-6 md:w-8 h-1 bg-amber-600 rounded-full"></div>
                    </div>

                    <p className="text-xs md:text-sm text-amber-600 mt-3 md:mt-4 tracking-widest uppercase font-medium">
                        Capture • Memories • Forever
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-sm md:max-w-md">
                    <Link href="/solo" className="flex-1">
                        <Button
                            className="w-full h-14 md:h-16 bg-amber-800 hover:bg-amber-700 text-white text-base md:text-lg font-medium tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-amber-900 rounded-lg hover:scale-105"
                            disabled={isLoading}
                        >
                            <Camera className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                            SOLO BOOTH
                        </Button>
                    </Link>

                    {process.env.NEXT_PUBLIC_SHOW_WITH_FRIENDS === "true" && (
                        <Link href="/friends" className="flex-1">
                            <Button
                                className="w-full h-14 md:h-16 bg-orange-700 hover:bg-orange-600 text-white text-base md:text-lg font-medium tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-800 rounded-lg hover:scale-105"
                                disabled={isLoading}
                            >
                                <Users className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                                GROUP BOOTH
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Animated Decorative Elements */}
                <div className="absolute top-8 md:top-10 left-6 md:left-10 w-12 md:w-20 h-12 md:h-20 border-4 border-amber-300 rounded-full opacity-30 animate-bounce"></div>
                <div className="absolute bottom-8 md:bottom-10 right-6 md:right-10 w-10 md:w-16 h-10 md:h-16 border-4 border-orange-300 rounded-full opacity-30 animate-pulse"></div>
                <div
                    className="absolute top-1/4 md:top-1/3 right-12 md:right-20 w-8 md:w-12 h-8 md:h-12 border-4 border-amber-400 rotate-45 opacity-20 animate-spin"
                    style={{ animationDuration: "8s" }}
                ></div>
                <div className="absolute bottom-1/4 md:bottom-1/3 left-12 md:left-20 w-6 md:w-8 h-6 md:h-8 border-4 border-orange-400 rotate-45 opacity-20 animate-ping"></div>

                {/* Additional floating elements for more movement */}
                <div
                    className="absolute top-1/2 left-4 md:left-8 w-4 md:w-6 h-4 md:h-6 bg-amber-300 rounded-full opacity-20 animate-bounce"
                    style={{ animationDelay: "1s", animationDuration: "3s" }}
                ></div>
                <div
                    className="absolute top-3/4 right-4 md:right-8 w-3 md:w-4 h-3 md:h-4 bg-orange-300 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>

                {/* Vintage Footer */}
                <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2">
                    <p className="text-xs text-amber-600 tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold text-center px-4">
                        {"Say Cheese!"} Since Forever
                    </p>
                </div>
            </div>

            {/* Custom CSS for floating animation */}
            <style jsx>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px) rotate(-1deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(1deg);
                    }
                }

                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
