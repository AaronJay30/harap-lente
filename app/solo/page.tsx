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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CameraPreview } from "@/components/camera-preview";
import { PhotoCapture } from "@/components/photo-capture";
import { TemplateSelector } from "@/components/template-selector";
import { SubTemplateSelector } from "@/components/sub-template-selector";
import { PhotoComposer } from "@/components/photo-composer";

type SessionStep =
    | "preview"
    | "capture"
    | "template"
    | "subtemplate"
    | "download";

export default function SoloPage() {
    const [currentStep, setCurrentStep] = useState<SessionStep>("preview");
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [selectedSubTemplate, setSelectedSubTemplate] = useState<string>("");
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [compositeImage, setCompositeImage] = useState<string>("");

    // On mount, check for valid localStorage photos
    useEffect(() => {
        try {
            const raw = localStorage.getItem("harapLentePhotos");
            if (raw) {
                const payload = JSON.parse(raw);
                if (
                    payload.expiresAt &&
                    Date.now() < payload.expiresAt &&
                    Array.isArray(payload.photos) &&
                    payload.photos.length > 0
                ) {
                    setCapturedPhotos(payload.photos);
                    setCurrentStep("template");
                } else if (
                    payload.expiresAt &&
                    Date.now() > payload.expiresAt
                ) {
                    localStorage.removeItem("harapLentePhotos");
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
        setCurrentStep("subtemplate");
    };

    const handleSubTemplateSelect = (subTemplateId: string) => {
        setSelectedSubTemplate(subTemplateId);
        setCurrentStep("download");
    };

    const handleReset = () => {
      setCapturedPhotos([]);
      setCompositeImage("");
      setCurrentStep("preview");
      setSelectedTemplate("");
      setSelectedSubTemplate("");
      localStorage.removeItem("harapLentePhotos");
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
    } else if (currentStep === "download") {
      setCurrentStep("subtemplate");
      setCompositeImage("");
    }
  }
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Header with Logo */}
            <div className="bg-amber-900 text-white px-4 shadow-lg">
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
            <div className="bg-white border-b border-amber-200 p-4">
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
            <div className="max-w-6xl mx-auto p-4">
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

                {currentStep === "download" && (
                    <PhotoComposer
                        photos={capturedPhotos}
                        templateId={selectedTemplate}
                        subTemplateId={selectedSubTemplate}
                        onCompositeReady={setCompositeImage}
                    />
                )}
            </div>
        </div>
    );
}
