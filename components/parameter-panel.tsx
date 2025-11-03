"use client"

import { ScrollArea } from "./ui/scroll-area"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import type { ShaderUniform } from "@/lib/shader-parser"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface ParameterPanelProps {
  uniforms: Record<string, ShaderUniform>
  values: Record<string, any>
  onChange: (name: string, value: any) => void
  onClose: () => void
}

export function ParameterPanel({ uniforms, values, onChange, onClose }: ParameterPanelProps) {
  const uniformEntries = Object.entries(uniforms).filter(
    ([name]) => !name.startsWith("u_time") && !name.startsWith("u_resolution") && !name.startsWith("u_mouse"),
  )

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Parameters</h2>
          <p className="text-xs text-muted-foreground">Adjust shader uniforms in real-time</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {uniformEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No custom parameters found. Add uniform variables to your shader code.
            </p>
          ) : (
            uniformEntries.map(([name, uniform]) => (
              <div key={name} className="space-y-2">
                <Label className="text-xs font-medium text-foreground">{name}</Label>

                {uniform.type === "float" && (
                  <div className="space-y-2">
                    <Slider
                      value={[values[name] ?? uniform.defaultValue]}
                      onValueChange={([v]) => onChange(name, v)}
                      min={uniform.min}
                      max={uniform.max}
                      step={uniform.step}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      value={values[name] ?? uniform.defaultValue}
                      onChange={(e) => onChange(name, Number.parseFloat(e.target.value))}
                      min={uniform.min}
                      max={uniform.max}
                      step={uniform.step}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                {uniform.type === "vec3" && uniform.isColor && (
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={rgbToHex(values[name] ?? uniform.defaultValue)}
                      onChange={(e) => onChange(name, hexToRgb(e.target.value))}
                      className="h-10 w-20"
                    />
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((i) => (
                        <Input
                          key={i}
                          type="number"
                          value={(values[name]?.[i] ?? uniform.defaultValue[i]).toFixed(2)}
                          onChange={(e) => {
                            const newValue = [...(values[name] ?? uniform.defaultValue)]
                            newValue[i] = Number.parseFloat(e.target.value)
                            onChange(name, newValue)
                          }}
                          min={0}
                          max={1}
                          step={0.01}
                          className="h-8 text-xs"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {uniform.type === "vec2" && (
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1].map((i) => (
                      <Input
                        key={i}
                        type="number"
                        value={values[name]?.[i] ?? uniform.defaultValue[i]}
                        onChange={(e) => {
                          const newValue = [...(values[name] ?? uniform.defaultValue)]
                          newValue[i] = Number.parseFloat(e.target.value)
                          onChange(name, newValue)
                        }}
                        className="h-8 text-xs"
                      />
                    ))}
                  </div>
                )}

                {uniform.type === "bool" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={values[name] ?? uniform.defaultValue}
                      onCheckedChange={(checked) => onChange(name, checked)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {(values[name] ?? uniform.defaultValue) ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function rgbToHex(rgb: number[]): string {
  const r = Math.round(rgb[0] * 255)
  const g = Math.round(rgb[1] * 255)
  const b = Math.round(rgb[2] * 255)
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

function hexToRgb(hex: string): number[] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}
