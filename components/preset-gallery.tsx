"use client"

import { Card } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface Preset {
  name: string
  description: string
  category: string
  code: string
}

interface PresetGalleryProps {
  presets: Preset[]
  onSelect: (preset: Preset) => void
  onClose: () => void
}

export function PresetGallery({ presets, onSelect, onClose }: PresetGalleryProps) {
  const categories = Array.from(new Set(presets.map((p) => p.category)))

  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Shader Presets</h2>
            <p className="text-sm text-muted-foreground">Choose a starting point for your shader</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-primary mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets
                    .filter((p) => p.category === category)
                    .map((preset) => (
                      <Card
                        key={preset.name}
                        className="p-4 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => onSelect(preset)}
                      >
                        <h4 className="font-semibold text-sm text-foreground mb-1">{preset.name}</h4>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
