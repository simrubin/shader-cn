"use client"

import { useState } from "react"
import type { ShaderUniform } from "@/lib/shader-parser"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { X, Play, Pause, RotateCcw, Shuffle, Palette, ChevronDown, ChevronUp } from "lucide-react"

interface FloatingControlsProps {
  uniforms: Record<string, ShaderUniform>
  values: Record<string, any>
  onChange: (name: string, value: any) => void
  onClose: () => void
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  onRandomize: () => void
  onShowPresets: () => void
  fps: number
}

export function FloatingControls({
  uniforms,
  values,
  onChange,
  onClose,
  isPlaying,
  onPlayPause,
  onReset,
  onRandomize,
  onShowPresets,
  fps,
}: FloatingControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const renderControl = (name: string, uniform: ShaderUniform) => {
    const value = values[name] ?? uniform.defaultValue

    if (uniform.type === "float") {
      return (
        <div key={name} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">{name.replace("u_", "").replace(/_/g, " ")}</Label>
            <span className="text-xs text-muted-foreground">{value.toFixed(2)}</span>
          </div>
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(name, v)}
            min={uniform.min}
            max={uniform.max}
            step={uniform.step}
            className="w-full"
          />
        </div>
      )
    }

    if (uniform.type === "vec3" && uniform.isColor) {
      const [r, g, b] = value
      const hexColor = `#${Math.round(r * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(g * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(b * 255)
        .toString(16)
        .padStart(2, "0")}`

      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">{name.replace("u_", "").replace(/_/g, " ")}</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => {
                const hex = e.target.value
                const r = Number.parseInt(hex.slice(1, 3), 16) / 255
                const g = Number.parseInt(hex.slice(3, 5), 16) / 255
                const b = Number.parseInt(hex.slice(5, 7), 16) / 255
                onChange(name, [r, g, b])
              }}
              className="w-12 h-8 rounded border border-border cursor-pointer"
            />
            <div className="flex-1 grid grid-cols-3 gap-1">
              {[0, 1, 2].map((i) => (
                <Slider
                  key={i}
                  value={[value[i]]}
                  onValueChange={([v]) => {
                    const newValue = [...value]
                    newValue[i] = v
                    onChange(name, newValue)
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (uniform.type === "bool") {
      return (
        <div key={name} className="flex items-center justify-between">
          <Label className="text-xs font-medium">{name.replace("u_", "").replace(/_/g, " ")}</Label>
          <Switch checked={value} onCheckedChange={(checked) => onChange(name, checked)} />
        </div>
      )
    }

    if (uniform.type === "vec2") {
      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">{name.replace("u_", "").replace(/_/g, " ")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1">
                <span className="text-xs text-muted-foreground">{i === 0 ? "X" : "Y"}</span>
                <Slider
                  value={[value[i]]}
                  onValueChange={([v]) => {
                    const newValue = [...value]
                    newValue[i] = v
                    onChange(name, newValue)
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="absolute top-4 right-4 w-80 bg-card/80 backdrop-blur-md border border-border rounded-4xl shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-card-foreground">Shader Controls</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPlayPause} className="flex-1 bg-transparent">
            {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={onRandomize}>
            <Shuffle className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={onShowPresets}>
            <Palette className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">FPS: {fps}</div>
      </div>

      {!isCollapsed && (
        <div className="p-6 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {Object.entries(uniforms)
            .filter(([name]) => !["u_time", "u_resolution", "u_mouse"].includes(name))
            .map(([name, uniform]) => renderControl(name, uniform))}
        </div>
      )}
    </div>
  )
}
