"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import type { shaderPresets } from "@/lib/shader-presets"

interface FloatingPresetsProps {
  presets: typeof shaderPresets
  onSelect: (preset: (typeof shaderPresets)[0]) => void
  onClose: () => void
}

export function FloatingPresets({ presets, onSelect, onClose }: FloatingPresetsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const categories = Array.from(new Set(presets.map((p) => p.category)))

  const filteredPresets = presets.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCategories = Array.from(new Set(filteredPresets.map((p) => p.category)))

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-card/95 border border-border rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between border-white">
          <h2 className="text-xl font-semibold text-card-foreground">Shader Presets</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-border">
          <input
            type="text"
            placeholder="Search shaders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-sm text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No shaders found matching "{searchQuery}"</div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredPresets
                    .filter((p) => p.category === category)
                    .map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => onSelect(preset)}
                        className="p-4 bg-muted/50 hover:bg-muted border border-border rounded-lg text-left transition-colors group"
                      >
                        <div className="font-medium text-sm mb-1 text-card-foreground group-hover:text-primary transition-colors">
                          {preset.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{preset.description}</div>
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
