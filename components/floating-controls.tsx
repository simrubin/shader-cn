"use client";

import { useState, useRef } from "react";
import type { ShaderUniform } from "@/lib/shader-parser";
import { Button } from "./ui/button";
import { LiquidSlider } from "./liquid-slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  Palette,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

interface FloatingControlsProps {
  uniforms: Record<string, ShaderUniform>;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onClose: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onRandomize: () => void;
  onShowPresets: () => void;
  onScreenshot: () => void;
  fps: number;
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
  onScreenshot,
  fps,
}: FloatingControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Pattern options for dithering shader
  const patternOptions = [
    { value: 0, label: "Wave" },
    { value: 1, label: "Spiral" },
    { value: 2, label: "Simplex" },
    { value: 3, label: "Orb" },
  ];
  
  // Dither type options for image dithering shader
  const ditherTypeOptions = [
    { value: 0, label: "8×8" },
    { value: 1, label: "4×4" },
    { value: 2, label: "2×2" },
  ];
  
  // Fit mode options for image dithering shader
  const fitModeOptions = [
    { value: 0, label: "Cover" },
    { value: 1, label: "Contain" },
    { value: 2, label: "Stretch" },
  ];

  const renderControl = (name: string, uniform: ShaderUniform) => {
    const value = values[name] ?? uniform.defaultValue;

    // Special handling for pattern selection (dithering shader)
    if (name === "u_pattern" && uniform.type === "float") {
      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">Pattern</Label>
          <div className="flex gap-1">
            {patternOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange(name, option.value)}
                className={`
                  flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${Math.round(value) === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    // Special handling for dither type selection (image dithering shader)
    if (name === "u_ditherType" && uniform.type === "float") {
      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">Dither Matrix</Label>
          <div className="flex gap-1">
            {ditherTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange(name, option.value)}
                className={`
                  flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${Math.round(value) === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    // Special handling for fit mode selection (image dithering shader)
    if (name === "u_fitMode" && uniform.type === "float") {
      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">Image Fit</Label>
          <div className="flex gap-1">
            {fitModeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange(name, option.value)}
                className={`
                  flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${Math.round(value) === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    // Special handling for animate toggle (image dithering shader)
    if (name === "u_animate" && uniform.type === "float") {
      return (
        <div key={name} className="flex items-center justify-between">
          <Label className="text-xs font-medium">Animate Dither</Label>
          <Switch
            checked={value > 0.5}
            onCheckedChange={(checked) => onChange(name, checked ? 1.0 : 0.0)}
          />
        </div>
      );
    }

    if (uniform.type === "float") {
      return (
        <div key={name} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">
              {name.replace("u_", "").replace(/_/g, " ")}
            </Label>
            <span className="text-xs text-muted-foreground">
              {value.toFixed(2)}
            </span>
          </div>
          <LiquidSlider
            value={value}
            onChange={(v) => onChange(name, v)}
            min={uniform.min}
            max={uniform.max}
            step={uniform.step}
            compact
          />
        </div>
      );
    }

    if (uniform.type === "vec3" && uniform.isColor) {
      const [r, g, b] = value;
      const hexColor = `#${Math.round(r * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(g * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(b * 255)
        .toString(16)
        .padStart(2, "0")}`;

      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">
            {name.replace("u_", "").replace(/_/g, " ")}
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => {
                const hex = e.target.value;
                const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
                const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
                const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
                onChange(name, [r, g, b]);
              }}
              className="w-12 h-8 rounded border border-border cursor-pointer"
            />
            <div className="flex-1 flex flex-col gap-1">
              {[0, 1, 2].map((i) => (
                <LiquidSlider
                  key={i}
                  value={value[i]}
                  onChange={(v) => {
                    const newValue = [...value];
                    newValue[i] = v;
                    onChange(name, newValue);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  compact
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (uniform.type === "bool") {
      return (
        <div key={name} className="flex items-center justify-between">
          <Label className="text-xs font-medium">
            {name.replace("u_", "").replace(/_/g, " ")}
          </Label>
          <Switch
            checked={value}
            onCheckedChange={(checked) => onChange(name, checked)}
          />
        </div>
      );
    }

    if (uniform.type === "vec2") {
      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">
            {name.replace("u_", "").replace(/_/g, " ")}
          </Label>
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1">
                <span className="text-xs text-muted-foreground">
                  {i === 0 ? "X" : "Y"}
                </span>
                <LiquidSlider
                  value={value[i]}
                  onChange={(v) => {
                    const newValue = [...value];
                    newValue[i] = v;
                    onChange(name, newValue);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (uniform.type === "sampler2D") {
      const hasImage = value?.image !== null;
      
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const img = new Image();
          img.onload = () => {
            onChange(name, {
              type: "texture",
              image: img,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          };
          img.src = URL.createObjectURL(file);
        }
      };

      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">
            {name.replace("u_", "").replace(/_/g, " ")}
          </Label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`
              flex items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 border-dashed
              transition-all cursor-pointer
              ${hasImage 
                ? "border-primary/50 bg-primary/10" 
                : "border-border hover:border-primary/30 hover:bg-muted/50"
              }
            `}>
              {hasImage ? (
                <>
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    {value.width}×{value.height}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (click to change)
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Upload Image
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="absolute top-5 right-5 w-80 bg-card-foreground/60 backdrop-blur-md  border-2 border-border rounded-3xl shadow-2xl overflow-hidden">
      <div className="p-7 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-normal text-foreground">
            Controls
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPlayPause}
            className="flex-1 bg-transparent"
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 mr-1" />
            ) : (
              <Play className="h-3 w-3 mr-1" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} title="Reset">
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRandomize}
            title="Randomize"
          >
            <Shuffle className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShowPresets}
            title="Presets"
          >
            <Palette className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onScreenshot}
            title="Save Screenshot"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>

        {/* <div className="text-xs text-muted-foreground">FPS: {fps}</div> */}
      </div>

      {!isCollapsed && (
        <div className="p-7 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {(() => {
            // Get current pattern value for conditional rendering
            const currentPattern = Math.round(values["u_pattern"] ?? 0);
            
            // Define which uniforms belong to which pattern
            const patternSpecificUniforms: Record<number, string[]> = {
              0: ["u_waveHeight", "u_waveFrequency"], // Wave
              1: ["u_spiralArms", "u_spiralTightness", "u_spiralSize", "u_spiralCenter"], // Spiral
              2: [], // Simplex (no specific controls)
              3: ["u_orbSize", "u_orbSoftness"], // Orb
            };
            
            // All pattern-specific uniforms (to filter out when not relevant)
            const allPatternUniforms = Object.values(patternSpecificUniforms).flat();
            
            // System uniforms to always hide
            const hiddenUniforms = ["u_time", "u_resolution", "u_mouse"];
            
            return Object.entries(uniforms)
              .filter(([name]) => {
                // Hide system uniforms
                if (hiddenUniforms.includes(name)) return false;
                
                // If it's a pattern-specific uniform, only show if current pattern matches
                if (allPatternUniforms.includes(name)) {
                  return patternSpecificUniforms[currentPattern]?.includes(name);
                }
                
                return true;
              })
              .map(([name, uniform]) => renderControl(name, uniform));
          })()}
        </div>
      )}
    </div>
  );
}
