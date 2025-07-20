"use client";

import { useState, useEffect } from "react";
import {
    RotateCcw,
    Download,
    Home,
    Eye,
    Zap,
    Square,
    Palette,
    CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CameraPreview } from "@/components/camera-preview";
import { PhotoCapture } from "@/components/photo-capture";
import { TemplateSelector } from "@/components/template-selector";
import {
    SubTemplateSelector,
    subTemplates as subTemplatesData,
} from "@/components/sub-template-selector";
import { PhotoComposer } from "@/components/photo-composer";
import { PhotoSelector } from "@/components/photo-selector";
import { DownloadImage } from "@/components/download-image";

type SessionStep =
    | "preview"
    | "capture"
    | "template"
    | "subtemplate"
    | "select"
    | "download";

export default function SoloPage() {
    const [currentStep, setCurrentStep] = useState<SessionStep>("preview");
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [selectedSubTemplate, setSelectedSubTemplate] = useState<string>("");
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [compositeImage, setCompositeImage] = useState<string>("");

    // On mount, check for valid localStorage photos, template, and style
    useEffect(() => {
        try {
            // Redirect to download if composite image exists
            const composite = localStorage.getItem("harapLenteCompositeImage");
            if (composite) {
                setCurrentStep("download");
                return;
            }
            const raw = localStorage.getItem("harapLentePhotos");
            const templateRaw = localStorage.getItem("harapLenteTemplate");
            const styleRaw = localStorage.getItem("harapLenteStyle");
            if (raw) {
                const payload = JSON.parse(raw);
                if (
                    payload.expiresAt &&
                    Date.now() < payload.expiresAt &&
                    Array.isArray(payload.photos) &&
                    payload.photos.length > 0
                ) {
                    setCapturedPhotos(payload.photos);
                    // If template and style are saved, restore them and go to select step
                    if (templateRaw && styleRaw) {
                        setSelectedTemplate(templateRaw);
                        setSelectedSubTemplate(styleRaw);
                        setCurrentStep("select");
                    } else {
                        setCurrentStep("template");
                    }
                } else if (
                    payload.expiresAt &&
                    Date.now() > payload.expiresAt
                ) {
                    localStorage.removeItem("harapLentePhotos");
                    localStorage.removeItem("harapLenteTemplate");
                    localStorage.removeItem("harapLenteStyle");
                }
            }
        } catch (e) {
            // Ignore JSON parse errors
        }
    }, []);

    const handleStartCapture = () => {
        setCurrentStep("capture");
    };

    const handlePhotosComplete = (photos: string[]) => {
        setCapturedPhotos(photos);
        setCurrentStep("template");
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        localStorage.setItem("harapLenteTemplate", templateId);
        setCurrentStep("subtemplate");
    };

    const handleSubTemplateSelect = (subTemplateId: string) => {
        setSelectedSubTemplate(subTemplateId);
        localStorage.setItem("harapLenteStyle", subTemplateId);
        setCurrentStep("select");
    };

    const handlePhotoSelectionConfirm = (photos: string[]) => {
        setSelectedPhotos(photos);
        setCurrentStep("download");
    };

    const handleReset = () => {
        setCapturedPhotos([]);
        setCompositeImage("");
        setCurrentStep("preview");
        setSelectedTemplate("");
        setSelectedSubTemplate("");
        localStorage.removeItem("harapLentePhotos");
        localStorage.removeItem("harapLenteTemplate");
        localStorage.removeItem("harapLenteStyle");
        localStorage.removeItem("harapLenteCompositeImage");
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case "preview":
                return "Camera Preview";
            case "capture":
                return "Taking Photos";
            case "template":
                return "Choose Layout";
            case "subtemplate":
                return "Choose Style";
            case "select":
                return "Select Photos";
            case "download":
                return "Your Photo Strip";
            default:
                return "Solo Session";
        }
    };

    function handleBack(): void {
        if (currentStep === "subtemplate") {
            setCurrentStep("template");
            setSelectedSubTemplate("");
        } else if (currentStep === "select") {
            setCurrentStep("subtemplate");
            setSelectedPhotos([]);
        } else if (currentStep === "download") {
            setCurrentStep("select");
            setCompositeImage("");
        }
    }
    const NOISE_BG =
        "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")";

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
            {/* Vintage grain overlay */}
            <div
                className="absolute inset-0 opacity-20 animate-pulse pointer-events-none"
                style={{
                    backgroundImage: NOISE_BG,
                    backgroundRepeat: "repeat",
                }}
            />

            {/* Decorative elements */}
            <div className="absolute top-8 md:top-10 left-6 md:left-10 w-12 md:w-20 h-12 md:h-20 border-4 border-amber-300 rounded-full opacity-30 animate-bounce pointer-events-none"></div>
            <div className="absolute bottom-8 md:bottom-10 right-6 md:right-10 w-10 md:w-16 h-10 md:h-16 border-4 border-orange-300 rounded-full opacity-30 animate-pulse pointer-events-none"></div>
            <div
                className="absolute top-1/4 md:top-1/3 right-12 md:right-20 w-8 md:w-12 h-8 md:h-12 border-4 border-amber-400 rotate-45 opacity-20 animate-spin pointer-events-none"
                style={{ animationDuration: "8s" }}
            ></div>
            <div className="absolute bottom-1/4 md:bottom-1/3 left-12 md:left-20 w-6 md:w-8 h-6 md:h-8 border-4 border-orange-400 rotate-45 opacity-20 animate-ping pointer-events-none"></div>
            <div
                className="absolute top-1/2 left-4 md:left-8 w-4 md:w-6 h-4 md:h-6 bg-amber-300 rounded-full opacity-20 animate-bounce pointer-events-none"
                style={{ animationDelay: "1s", animationDuration: "3s" }}
            ></div>
            <div
                className="absolute top-3/4 right-4 md:right-8 w-3 md:w-4 h-3 md:h-4 bg-orange-300 rounded-full opacity-20 animate-pulse pointer-events-none"
                style={{ animationDelay: "2s" }}
            ></div>

            {/* Vintage Footer */}
            <div className="absolute bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
                <br />
                <p className="text-xs text-amber-600 tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold text-center px-4 pt-5">
                    {"Say Cheese!"} Since Forever
                </p>
            </div>

            {/* Header with Logo */}
            <div className="bg-amber-900 text-white px-4 shadow-lg relative z-10">
                <div className=" mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Image
                            src="/images/HarapLenteHorizontal.png"
                            alt="Harap Lente"
                            width={400}
                            height={100}
                            className="h-24 w-auto"
                        />
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold tracking-wide">
                                {getStepTitle()}
                            </h1>
                            <p className="text-amber-200 text-sm">
                                Solo Photobooth Session
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="bg-transparent border-white text-white hover:bg-white hover:text-amber-900"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            <span className="hidden md:inline">Reset</span>
                        </Button>
                        <Link href="/">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent border-white text-white hover:bg-white hover:text-amber-900"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                <span className="hidden md:inline">Home</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white border-b border-amber-200 p-4 relative z-10">
                <div className="max-w-6xl mx-auto flex flex-col gap-2 items-center justify-center">
                    {/* Desktop: 1 line */}
                    <div className="hidden md:flex items-center justify-center space-x-4 md:space-x-8 overflow-x-auto">
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "preview"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Eye className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Preview
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "capture"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Zap className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Capture
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "template"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Square className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Layout
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "subtemplate"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Palette className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Style
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>

                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "select"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <CheckSquare className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Select
                            </span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-300"></div>
                        <div
                            className={`flex items-center whitespace-nowrap ${
                                currentStep === "download"
                                    ? "text-amber-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <Download className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="font-medium text-sm md:text-base">
                                Download
                            </span>
                        </div>
                    </div>
                    {/* Mobile: 2 lines */}
                    <div className="flex md:hidden flex-col gap-2 w-full items-center">
                        <div className="flex items-center justify-center space-x-4 overflow-x-auto">
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "preview"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Preview
                                </span>
                            </div>
                            <div className="w-4 h-px bg-gray-300"></div>
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "capture"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Capture
                                </span>
                            </div>
                            <div className="w-4 h-px bg-gray-300"></div>
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "template"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Square className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Layout
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-4 overflow-x-auto">
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "select"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <CheckSquare className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Select
                                </span>
                            </div>
                            <div className="w-4 h-px bg-gray-300"></div>
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "subtemplate"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Palette className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Style
                                </span>
                            </div>
                            <div className="w-4 h-px bg-gray-300"></div>
                            <div
                                className={`flex items-center whitespace-nowrap ${
                                    currentStep === "download"
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">
                                    Download
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-4 relative z-10 pb-5">
                {currentStep === "preview" && (
                    <CameraPreview onStartCapture={handleStartCapture} />
                )}

                {currentStep === "capture" && (
                    <PhotoCapture
                        onPhotosComplete={handlePhotosComplete}
                        countdownTime={2}
                    />
                )}

                {currentStep === "template" && (
                    <TemplateSelector onTemplateSelect={handleTemplateSelect} />
                )}

                {currentStep === "subtemplate" && (
                    <SubTemplateSelector
                        templateId={selectedTemplate}
                        onSubTemplateSelect={handleSubTemplateSelect}
                        onBack={handleBack}
                    />
                )}

                {currentStep === "select" && (
                    <PhotoSelector
                        photos={capturedPhotos}
                        templateId={selectedTemplate}
                        subTemplateId={selectedSubTemplate}
                        onBack={handleBack}
                        templateImage={(() => {
                            // Find the template image from subTemplates
                            const subTemplates =
                                (
                                    subTemplatesData as Record<
                                        string,
                                        Array<{
                                            id: string;
                                            name: string;
                                            description: string;
                                            template: string;
                                            preview: string;
                                        }>
                                    >
                                )[selectedTemplate] || [];
                            const found = subTemplates.find(
                                (t) => t.id === selectedSubTemplate
                            );
                            return found?.template || "";
                        })()}
                        onConfirm={handlePhotoSelectionConfirm}
                    />
                )}

                {currentStep === "download" && (
                    <>
                        <DownloadImage />
                    </>
                )}
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
