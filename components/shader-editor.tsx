"use client"

import { useState, useEffect } from "react"
import { ShaderCanvas } from "./shader-canvas"
import { shaderPresets } from "@/lib/shader-presets"
import { parseShaderUniforms, type ShaderUniform } from "@/lib/shader-parser"
import { FloatingControls } from "./floating-controls"
import { FloatingPresets } from "./floating-presets"

export function ShaderEditor() {
  const [shaderCode, setShaderCode] = useState(shaderPresets[0].code)
  const [uniforms, setUniforms] = useState<Record<string, ShaderUniform>>({})
  const [uniformValues, setUniformValues] = useState<Record<string, any>>({})
  const [isPlaying, setIsPlaying] = useState(true)
  const [showPresets, setShowPresets] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [fps, setFps] = useState(60)
  const [compileError, setCompileError] = useState<string | null>(null)

  useEffect(() => {
    const parsed = parseShaderUniforms(shaderCode)
    setUniforms(parsed)

    // Initialize uniform values with defaults
    const newValues: Record<string, any> = {}
    Object.entries(parsed).forEach(([name, uniform]) => {
      if (!(name in uniformValues)) {
        newValues[name] = uniform.defaultValue
      } else {
        newValues[name] = uniformValues[name]
      }
    })
    setUniformValues((prev) => ({ ...prev, ...newValues }))
  }, [shaderCode])

  const handlePresetSelect = (preset: (typeof shaderPresets)[0]) => {
    setShaderCode(preset.code)
    setShowPresets(false)
    setCompileError(null)
  }

  const handleUniformChange = (name: string, value: any) => {
    setUniformValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    const newValues: Record<string, any> = {}
    Object.entries(uniforms).forEach(([name, uniform]) => {
      newValues[name] = uniform.defaultValue
    })
    setUniformValues(newValues)
  }

  const handleRandomize = () => {
    const newValues: Record<string, any> = {}
    Object.entries(uniforms).forEach(([name, uniform]) => {
      if (uniform.type === "float") {
        const range = uniform.max - uniform.min
        newValues[name] = uniform.min + Math.random() * range
      } else if (uniform.type === "vec3" && uniform.isColor) {
        newValues[name] = [Math.random(), Math.random(), Math.random()]
      } else if (uniform.type === "vec2") {
        newValues[name] = [Math.random(), Math.random()]
      } else if (uniform.type === "bool") {
        newValues[name] = Math.random() > 0.5
      }
    })
    setUniformValues((prev) => ({ ...prev, ...newValues }))
  }

  return (
    <div className="h-screen w-full relative overflow-hidden dark">
      <ShaderCanvas
        fragmentShader={shaderCode}
        uniforms={uniformValues}
        isPlaying={isPlaying}
        onFpsUpdate={setFps}
        onError={setCompileError}
      />

      {showControls && (
        <FloatingControls
          uniforms={uniforms}
          values={uniformValues}
          onChange={handleUniformChange}
          onClose={() => setShowControls(false)}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onReset={handleReset}
          onRandomize={handleRandomize}
          onShowPresets={() => setShowPresets(true)}
          fps={fps}
        />
      )}

      {showPresets && (
        <FloatingPresets presets={shaderPresets} onSelect={handlePresetSelect} onClose={() => setShowPresets(false)} />
      )}

      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 right-4 bg-card/80 backdrop-blur-md border border-border rounded-lg px-4 py-2 text-sm font-medium hover:bg-card transition-colors"
        >
          Show Controls
        </button>
      )}
    </div>
  )
}
