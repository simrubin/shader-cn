"use client"

import { Button } from "./ui/button"
import { Play, Pause, Grid3x3, RotateCcw, Shuffle, Code, SlidersHorizontal, Download } from "lucide-react"
import { Separator } from "./ui/separator"

interface ToolbarProps {
  isPlaying: boolean
  onPlayPause: () => void
  onShowPresets: () => void
  onReset: () => void
  onRandomize: () => void
  fps: number
  showCode: boolean
  showParams: boolean
  onToggleCode: () => void
  onToggleParams: () => void
}

export function Toolbar({
  isPlaying,
  onPlayPause,
  onShowPresets,
  onReset,
  onRandomize,
  fps,
  showCode,
  showParams,
  onToggleCode,
  onToggleParams,
}: ToolbarProps) {
  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `shader-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-foreground mr-4">Shader Studio</h1>

        <Button variant="ghost" size="sm" onClick={onPlayPause}>
          {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" onClick={onShowPresets}>
          <Grid3x3 className="h-4 w-4 mr-2" />
          Presets
        </Button>

        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>

        <Button variant="ghost" size="sm" onClick={onRandomize}>
          <Shuffle className="h-4 w-4 mr-2" />
          Randomize
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" onClick={handleScreenshot}>
          <Download className="h-4 w-4 mr-2" />
          Screenshot
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground mr-2">
          <span className="font-mono">{fps} FPS</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button variant={showCode ? "secondary" : "ghost"} size="sm" onClick={onToggleCode}>
          <Code className="h-4 w-4 mr-2" />
          Code
        </Button>

        <Button variant={showParams ? "secondary" : "ghost"} size="sm" onClick={onToggleParams}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Parameters
        </Button>
      </div>
    </div>
  )
}
