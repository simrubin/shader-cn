"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShaderCanvas } from "./shader-canvas";
import { shaderPresets } from "@/lib/shader-presets";
import { parseShaderUniforms, type ShaderUniform } from "@/lib/shader-parser";
import { FloatingControls } from "./floating-controls";
import { R3FCanvas } from "./r3f-canvas";
import { R3FFullscreenCanvas } from "./r3f-fullscreen-canvas";

export function ShaderEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPresetName = searchParams.get("preset");
  const initialPreset =
    shaderPresets.find((p) => p.name === initialPresetName) || shaderPresets[0];

  const [shaderCode, setShaderCode] = useState(initialPreset.code);
  const [vertexShaderCode, setVertexShaderCode] = useState<string | undefined>(
    initialPreset.vertexShader
  );
  const [renderMode, setRenderMode] = useState<"canvas" | "mesh" | "fullscreen">(
    initialPreset.mode || "canvas"
  );
  const [uniforms, setUniforms] = useState<Record<string, ShaderUniform>>({});
  const [uniformValues, setUniformValues] = useState<Record<string, any>>({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [fps, setFps] = useState(60);
  const [compileError, setCompileError] = useState<string | null>(null);

  const canvasRef = useRef<any>(null);

  useEffect(() => {
    setShaderCode(initialPreset.code);
    setVertexShaderCode(initialPreset.vertexShader);
    setRenderMode(initialPreset.mode || "canvas");
  }, [initialPreset]);

  useEffect(() => {
    const parsed = parseShaderUniforms(shaderCode);
    setUniforms(parsed);

    // Initialize uniform values with defaults
    const newValues: Record<string, any> = {};
    Object.entries(parsed).forEach(([name, uniform]) => {
      if (!(name in uniformValues)) {
        newValues[name] = uniform.defaultValue;
      } else {
        newValues[name] = uniformValues[name];
      }
    });
    setUniformValues((prev) => ({ ...prev, ...newValues }));
  }, [shaderCode]);

  const handleUniformChange = (name: string, value: any) => {
    setUniformValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    const newValues: Record<string, any> = {};
    Object.entries(uniforms).forEach(([name, uniform]) => {
      newValues[name] = uniform.defaultValue;
    });
    setUniformValues(newValues);
  };

  const handleRandomize = () => {
    const newValues: Record<string, any> = {};
    Object.entries(uniforms).forEach(([name, uniform]) => {
      // Skip texture uniforms - don't randomize images
      if (uniform.type === "sampler2D") {
        return;
      }
      if (uniform.type === "float") {
        const range = uniform.max - uniform.min;
        newValues[name] = uniform.min + Math.random() * range;
      } else if (uniform.type === "vec3" && uniform.isColor) {
        newValues[name] = [Math.random(), Math.random(), Math.random()];
      } else if (uniform.type === "vec2") {
        newValues[name] = [Math.random(), Math.random()];
      } else if (uniform.type === "bool") {
        newValues[name] = Math.random() > 0.5;
      }
    });
    setUniformValues((prev) => ({ ...prev, ...newValues }));
  };

  const handleScreenshot = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "shader-output.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="h-screen w-full relative bg-slate-100 overflow-hidden dark p-2">
      <div className="w-full h-full rounded-4xl overflow-hidden">
        {renderMode === "mesh" ? (
          <R3FCanvas
            ref={canvasRef}
            fragmentShader={shaderCode}
            vertexShader={vertexShaderCode}
            uniforms={uniformValues}
            isPlaying={isPlaying}
          />
        ) : renderMode === "fullscreen" ? (
          <R3FFullscreenCanvas
            ref={canvasRef}
            fragmentShader={shaderCode}
            uniforms={uniformValues}
            isPlaying={isPlaying}
            onFpsUpdate={setFps}
            onError={setCompileError}
          />
        ) : (
          <ShaderCanvas
            ref={canvasRef}
            fragmentShader={shaderCode}
            uniforms={uniformValues}
            isPlaying={isPlaying}
            onFpsUpdate={setFps}
            onError={setCompileError}
          />
        )}
      </div>

      {compileError && (
        <div className="absolute bottom-4 left-4 right-4 z-50 bg-red-500/80 text-white p-4 rounded-lg backdrop-blur-md border border-red-400 font-mono text-sm whitespace-pre-wrap">
          <strong>Shader Error:</strong>
          <div className="mt-2 max-h-40 overflow-y-auto">{compileError}</div>
          <button
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded"
            onClick={() => setCompileError(null)}
          >
            ✕
          </button>
        </div>
      )}

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
          onShowPresets={() => router.push("/")}
          onScreenshot={handleScreenshot}
          fps={fps}
        />
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
  );
}
