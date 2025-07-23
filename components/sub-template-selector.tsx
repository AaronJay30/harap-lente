"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SubTemplateSelectorProps {
    templateId: string;
    onSubTemplateSelect: (subTemplateId: string) => void;
    onBack?: () => void;
}

export const subTemplates = {
    "1x1-classic": [
        {
            id: "1x1-plain",
            name: "Plain",
            description: "Minimal plain style",
            template: "/template/Single/plain.png",
            preview: "/template/Single/plain(P).png",
        },
        {
            id: "1x1-paper",
            name: "Paper",
            description: "Simple paper style",
            template: "/template/Single/paper.png",
            preview: "/template/Single/paper(P).png",
        },
        {
            id: "1x1-sky",
            name: "Sky",
            description: "Bright sky background",
            template: "/template/Single/Sky.png",
            preview: "/template/Single/Sky(P).png",
        },
    ],
    "1x2-duo": [
        {
            id: "1x2-plain",
            name: "Plain",
            description: "Minimal plain style",
            template: "/template/Double/Plain.png",
            preview: "/template/Double/Plain(P).png",
        },
        {
            id: "1x2-cute",
            name: "Cute",
            description: "Cute style with playful elements",
            template: "/template/Double/Cute.png",
            preview: "/template/Double/Cute(P).png",
        },
        {
            id: "1x2-comic",
            name: "Comic",
            description: "Comic style with bold lines",
            template: "/template/Double/Comic.png",
            preview: "/template/Double/Comic(P).png",
        },
        {
            id: "1x2-retro",
            name: "Retro",
            description: "Retro style with vintage colors",
            template: "/template/Double/Retro.png",
            preview: "/template/Double/Retro(P).png",
        },
    ],
    "1x3-triple": [
        {
            id: "1x3-plain",
            name: "Plain Triple",
            description: "Simple classic layout",
            template: "/template/triple/Plain.png",
            preview: "/template/triple/Plain(P).png",
        },
        {
            id: "1x3-kawaii",
            name: "Kawaii Theme",
            description: "Cute and colorful style",
            template: "/template/triple/Kawaii.png",
            preview: "/template/triple/Kawaii(P).png",
        },
        {
            id: "1x3-kisses",
            name: "Kisses Theme",
            description: "Romantic theme with lips and hearts",
            template: "/template/triple/Kisses.png",
            preview: "/template/triple/Kisses(P).png",
        },
        {
            id: "1x3-halloween",
            name: "Halloween (Boo)",
            description: "Spooky and fun Halloween theme",
            template: "/template/triple/Boo.png",
            preview: "/template/triple/Boo(P).png",
        },
        {
            id: "1x3-vintage",
            name: "Vintage Theme",
            description: "Classic sepia and ornate border",
            template: "/template/triple/Vintage.png",
            preview: "/template/triple/Vintage(P).png",
        },
    ],
    "1x4-strip": [
        {
            id: "1x4-Plain",
            name: "Plain Strip",
            description: "Traditional 4-photo strip",
            template: "/template/Quadruple/Plain.png",
            preview: "/template/Quadruple/Plain(P).png",
        },
        {
            id: "1x4-vintage",
            name: "Scrapbook Style",
            description: "Handmade look with tape and stickers",
            template: "/template/Quadruple/Scrapbook.png",
            preview: "/template/Quadruple/Scrapbook(P).png",
        },
        {
            id: "1x4-groovy",
            name: "Groovy Style",
            description: "Psychedelic colors and funky patterns",
            template: "/template/Quadruple/Groovy.png",
            preview: "/template/Quadruple/Groovy(P).png",
        },
    ],
};

export function SubTemplateSelector({
    templateId,
    onSubTemplateSelect,
}: SubTemplateSelectorProps) {
    const [selectedSubTemplate, setSelectedSubTemplate] = useState<string>("");
    // Get onBack from props
    const { onBack } = arguments[0] || {};

    const availableSubTemplates =
        subTemplates[templateId as keyof typeof subTemplates] || [];
    const templateName = templateId.split("-")[1] || "template";

    const handleSelect = (subTemplateId: string) => {
        setSelectedSubTemplate(subTemplateId);
    };

    const handleConfirm = () => {
        if (selectedSubTemplate) {
            onSubTemplateSelect(selectedSubTemplate);
        }
    };

    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900 mb-2">
                    Choose Your Style
                </h2>
                <p className="text-amber-700">
                    Select a style variation for your {templateName} layout
                </p>
                {onBack && (
                    <div className="flex justify-center mt-4">
                        <Button
                            type="button"
                            onClick={onBack}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-6 py-2 text-base font-medium rounded shadow"
                        >
                            &larr; Back to Templates
                        </Button>
                    </div>
                )}

                {selectedSubTemplate && (
                    <div className="text-center mt-4">
                        <Button
                            onClick={handleConfirm}
                            className="bg-amber-800 hover:bg-amber-700 text-white px-8 py-3 text-lg font-medium tracking-wide shadow-lg"
                        >
                            Create Photo Strip
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 mb-8">
                {availableSubTemplates.map((subTemplate) => (
                    <Card
                        key={subTemplate.id}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedSubTemplate === subTemplate.id
                                ? "ring-4 ring-amber-500 shadow-lg"
                                : "hover:ring-2 hover:ring-amber-300"
                        }`}
                        onClick={() => handleSelect(subTemplate.id)}
                    >
                        <CardContent className="p-4">
                            <div className="aspect-[3/4] bg-amber-100 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-amber-300">
                                <img
                                    src={
                                        subTemplate.preview ||
                                        "/placeholder.svg"
                                    }
                                    alt={subTemplate.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            <h3 className="font-bold text-amber-900 mb-1">
                                {subTemplate.name}
                            </h3>
                            <p className="text-sm text-amber-700">
                                {subTemplate.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
