"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateSelectorProps {
    onTemplateSelect: (templateId: string) => void;
}

const templates = [
    {
        id: "1x1-classic",
        name: "Classic Single",
        layout: "1x1",
        description: "One perfect shot",
        preview: "/template/Classic Single.png",
    },
    {
        id: "1x2-duo",
        name: "Double Take",
        layout: "1x2",
        description: "Two moments captured",
        preview: "/template/Double Take.png",
    },
    {
        id: "1x3-triple",
        name: "Triple Charm",
        layout: "1x3",
        description: "Three's company",
        preview: "/template/Triple Charm.png",
    },
    {
        id: "1x4-strip",
        name: "Photo Strip",
        layout: "1x4",
        description: "Classic four-shot strip",
        preview: "/template/Photo Strip.png",
    },
];

export function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");

    const handleSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
    };

    const handleConfirm = () => {
        if (selectedTemplate) {
            onTemplateSelect(selectedTemplate);
        }
    };

    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900 mb-2">
                    Choose Your Template
                </h2>
                <p className="text-amber-700">
                    Select a layout for your vintage photo strip
                </p>
            </div>

            {selectedTemplate && (
                <div className="text-center mb-8">
                    <Button
                        onClick={handleConfirm}
                        className="bg-amber-800 hover:bg-amber-700 text-white px-8 py-3 text-lg font-medium tracking-wide shadow-lg"
                    >
                        Continue with{" "}
                        {templates.find((t) => t.id === selectedTemplate)?.name}
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 mb-8">
                {templates.map((template) => (
                    <Card
                        key={template.id}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedTemplate === template.id
                                ? "ring-4 ring-amber-500 shadow-lg"
                                : "hover:ring-2 hover:ring-amber-300"
                        }`}
                        onClick={() => handleSelect(template.id)}
                    >
                        <CardContent className="p-4">
                            <div className="aspect-[3/4] bg-amber-100 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-amber-300">
                                <img
                                    src={template.preview || "/placeholder.svg"}
                                    alt={template.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            <h3 className="font-bold text-amber-900 mb-1">
                                {template.name}
                            </h3>
                            <p className="text-sm text-amber-700 mb-2">
                                {template.description}
                            </p>
                            <div className="text-xs text-amber-600 font-medium">
                                Layout: {template.layout}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
