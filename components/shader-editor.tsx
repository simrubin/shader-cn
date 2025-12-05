"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShaderCanvas, ShaderCanvasRef } from "./shader-canvas";
import { shaderPresets } from "@/lib/shader-presets";
import { parseShaderUniforms, type ShaderUniform } from "@/lib/shader-parser";
import { ControlPanel } from "./control-panel";
import { CodePanel } from "./code-panel";
import { R3FCanvas } from "./r3f-canvas";
import { R3FFullscreenCanvas } from "./r3f-fullscreen-canvas";
import { ChevronLeft } from "lucide-react";

// GIF encoder for recording
declare global {
  interface Window {
    GIF?: any;
  }
}

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
  const [renderMode, setRenderMode] = useState<
    "canvas" | "mesh" | "fullscreen"
  >(
    (initialPreset.mode === "component" ? "canvas" : initialPreset.mode) ||
      "canvas"
  );
  const [uniforms, setUniforms] = useState<Record<string, ShaderUniform>>({});
  const [uniformValues, setUniformValues] = useState<Record<string, any>>({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(60);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [currentPresetName, setCurrentPresetName] = useState(
    initialPreset.name
  );

  // Panel states
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFormat, setRecordingFormat] = useState<
    "mp4" | "webm" | "gif"
  >("webm");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const gifRef = useRef<any>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const canvasRef = useRef<ShaderCanvasRef>(null);

  useEffect(() => {
    setShaderCode(initialPreset.code);
    setVertexShaderCode(initialPreset.vertexShader);
    setRenderMode(
      (initialPreset.mode === "component" ? "canvas" : initialPreset.mode) ||
        "canvas"
    );
    setCurrentPresetName(initialPreset.name);
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
      // Skip texture uniforms
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

  const handleApplyPreset = (presetValues: Record<string, any>) => {
    setUniformValues((prev) => ({ ...prev, ...presetValues }));
  };

  // Export image with scale
  const handleExportImage = useCallback(
    (scale: number) => {
      if (canvasRef.current?.canvas) {
        const canvas = canvasRef.current.canvas;

        // Create a new canvas with the scaled dimensions
        const exportCanvas = document.createElement("canvas");
        const ctx = exportCanvas.getContext("2d");
        if (!ctx) return;

        exportCanvas.width = canvas.width * scale;
        exportCanvas.height = canvas.height * scale;

        // Draw the original canvas scaled
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

        // Download
        const link = document.createElement("a");
        link.download = `${currentPresetName
          .replace(/\s+/g, "-")
          .toLowerCase()}-${scale}x.png`;
        link.href = exportCanvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    [currentPresetName]
  );

  // Start recording
  const handleStartRecording = useCallback(
    async (format: "mp4" | "webm" | "gif") => {
      if (!canvasRef.current?.canvas) return;

      const canvas = canvasRef.current.canvas;
      setRecordingFormat(format);
      setIsRecording(true);
      recordedChunksRef.current = [];

      if (format === "gif") {
        // Load GIF.js if not already loaded
        if (!window.GIF) {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js";
          script.onload = () => startGifRecording(canvas);
          document.head.appendChild(script);
        } else {
          startGifRecording(canvas);
        }
      } else {
        // WebM or MP4 recording using MediaRecorder
        const stream = canvas.captureStream(30);
        const mimeType = format === "mp4" ? "video/mp4" : "video/webm";

        // Check for codec support
        let options: MediaRecorderOptions = { mimeType };
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          options = { mimeType: "video/webm" };
        }

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, {
            type: options.mimeType,
          });
          downloadBlob(blob, format);
        };

        mediaRecorder.start(100);
      }
    },
    [currentPresetName]
  );

  const startGifRecording = (canvas: HTMLCanvasElement) => {
    if (!window.GIF) return;

    gifRef.current = new window.GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript:
        "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js",
    });

    gifRef.current.on("finished", (blob: Blob) => {
      downloadBlob(blob, "gif");
      setIsRecording(false);
    });

    // Capture frames
    recordingIntervalRef.current = setInterval(() => {
      if (gifRef.current && canvasRef.current?.canvas) {
        gifRef.current.addFrame(canvasRef.current.canvas, {
          delay: 33,
          copy: true,
        });
      }
    }, 33); // ~30fps
  };

  // Stop recording
  const handleStopRecording = useCallback(() => {
    if (recordingFormat === "gif") {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (gifRef.current) {
        gifRef.current.render();
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  }, [recordingFormat]);

  const downloadBlob = (blob: Blob, format: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${currentPresetName
      .replace(/\s+/g, "-")
      .toLowerCase()}-recording.${format}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-full relative bg-background overflow-hidden">
      {/* Back Button near sidebar toggles */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-4 right-20 z-50 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg hover:bg-card transition-colors flex items-center gap-2"
        title="Back to Gallery"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Shader Canvas */}
      <div className="w-full h-full">
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

      {/* Compile Error */}
      {compileError && (
        <div className="absolute bottom-4 left-4 right-4 z-50 bg-destructive/90 text-destructive-foreground p-4 rounded-xl backdrop-blur-md border border-destructive font-mono text-sm whitespace-pre-wrap">
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

      {/* Recording Indicator */}
      {isRecording && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive text-destructive-foreground">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}

      {/* Code Panel (Left) */}
      <CodePanel
        isOpen={isCodePanelOpen}
        onToggle={() => setIsCodePanelOpen(!isCodePanelOpen)}
        shaderCode={shaderCode}
        shaderName={currentPresetName}
        uniformValues={uniformValues}
        renderMode={renderMode}
      />

      {/* Control Panel (Right) */}
      <ControlPanel
        isOpen={isControlPanelOpen}
        onToggle={() => setIsControlPanelOpen(!isControlPanelOpen)}
        uniforms={uniforms}
        values={uniformValues}
        onChange={handleUniformChange}
        onApplyPreset={handleApplyPreset}
        onBack={() => router.push("/")}
        panelOpacity={0.8}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onReset={handleReset}
        onRandomize={handleRandomize}
        onExportImage={handleExportImage}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        isRecording={isRecording}
        fps={fps}
        shaderName={currentPresetName}
      />
    </div>
  );
}
