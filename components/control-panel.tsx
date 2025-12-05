"use client";

import { useState, useRef, useEffect } from "react";
import type { ShaderUniform } from "@/lib/shader-parser";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  Image as ImageIcon,
  Video,
  Upload,
  Check,
  ChevronDown,
  ChevronRight,
  PanelRight,
  Palette,
  Sidebar,
  SidebarOpen,
  SidebarClose,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";

// Shader presets by shader name
const SHADER_PRESETS: Record<
  string,
  { name: string; values: Record<string, any> }[]
> = {
  "Mesh Gradient": [
    {
      name: "Sunset",
      values: {
        u_speed: 0.3,
        u_distortion: 0.2,
        u_swirl: 0.15,
        u_grainMixer: 0.1,
        u_grainOverlay: 0.02,
        u_color1: [1.0, 0.4, 0.3],
        u_color2: [1.0, 0.6, 0.2],
        u_color3: [0.9, 0.3, 0.5],
        u_color4: [0.3, 0.2, 0.5],
        u_color5: [0.2, 0.1, 0.3],
      },
    },
    {
      name: "Ocean",
      values: {
        u_speed: 0.4,
        u_distortion: 0.25,
        u_swirl: 0.2,
        u_grainMixer: 0.05,
        u_grainOverlay: 0.01,
        u_color1: [0.1, 0.5, 0.8],
        u_color2: [0.2, 0.7, 0.9],
        u_color3: [0.0, 0.4, 0.6],
        u_color4: [0.3, 0.8, 0.7],
        u_color5: [0.1, 0.3, 0.5],
      },
    },
    {
      name: "Aurora",
      values: {
        u_speed: 0.6,
        u_distortion: 0.3,
        u_swirl: 0.25,
        u_grainMixer: 0.0,
        u_grainOverlay: 0.0,
        u_color1: [0.2, 0.9, 0.5],
        u_color2: [0.4, 0.3, 0.9],
        u_color3: [0.1, 0.7, 0.8],
        u_color4: [0.6, 0.2, 0.8],
        u_color5: [0.3, 0.8, 0.4],
      },
    },
    {
      name: "Candy",
      values: {
        u_speed: 0.5,
        u_distortion: 0.15,
        u_swirl: 0.1,
        u_grainMixer: 0.15,
        u_grainOverlay: 0.04,
        u_color1: [1.0, 0.7, 0.8],
        u_color2: [0.7, 0.9, 1.0],
        u_color3: [1.0, 0.9, 0.6],
        u_color4: [0.8, 0.7, 1.0],
        u_color5: [0.6, 1.0, 0.8],
      },
    },
  ],
  "Simplex Flow": [
    {
      name: "Lava",
      values: {
        u_speed: 0.8,
        u_scale: 2.0,
        u_intensity: 1.5,
        u_color1: [1.0, 0.2, 0.0],
        u_color2: [1.0, 0.5, 0.0],
        u_color3: [0.3, 0.0, 0.0],
      },
    },
    {
      name: "Plasma",
      values: {
        u_speed: 1.2,
        u_scale: 3.0,
        u_intensity: 2.0,
        u_color1: [0.5, 0.0, 1.0],
        u_color2: [1.0, 0.0, 0.5],
        u_color3: [0.0, 0.5, 1.0],
      },
    },
    {
      name: "Smoke",
      values: {
        u_speed: 0.3,
        u_scale: 1.5,
        u_intensity: 0.8,
        u_color1: [0.2, 0.2, 0.2],
        u_color2: [0.4, 0.4, 0.4],
        u_color3: [0.1, 0.1, 0.1],
      },
    },
    {
      name: "Neon",
      values: {
        u_speed: 0.6,
        u_scale: 2.5,
        u_intensity: 1.8,
        u_color1: [0.0, 1.0, 0.5],
        u_color2: [1.0, 0.0, 1.0],
        u_color3: [0.0, 0.5, 1.0],
      },
    },
  ],
  "Aurora Borealis": [
    {
      name: "Northern Lights",
      values: {
        u_speed: 0.5,
        u_waveHeight: 0.3,
        u_waveFrequency: 2.0,
        u_color1: [0.0, 1.0, 0.5],
        u_color2: [0.0, 0.5, 1.0],
        u_color3: [0.5, 0.0, 1.0],
      },
    },
    {
      name: "Solar Wind",
      values: {
        u_speed: 0.8,
        u_waveHeight: 0.5,
        u_waveFrequency: 3.0,
        u_color1: [1.0, 0.3, 0.0],
        u_color2: [1.0, 0.8, 0.0],
        u_color3: [1.0, 0.0, 0.3],
      },
    },
    {
      name: "Ice Storm",
      values: {
        u_speed: 0.3,
        u_waveHeight: 0.2,
        u_waveFrequency: 1.5,
        u_color1: [0.7, 0.9, 1.0],
        u_color2: [0.5, 0.7, 0.9],
        u_color3: [0.9, 0.95, 1.0],
      },
    },
    {
      name: "Ethereal",
      values: {
        u_speed: 0.4,
        u_waveHeight: 0.4,
        u_waveFrequency: 2.5,
        u_color1: [0.8, 0.6, 1.0],
        u_color2: [0.6, 0.8, 1.0],
        u_color3: [1.0, 0.7, 0.9],
      },
    },
  ],
  "Lava Lamp": [
    {
      name: "Classic",
      values: {
        u_speed: 0.5,
        u_blobSize: 0.3,
        u_color1: [1.0, 0.2, 0.0],
        u_color2: [1.0, 0.6, 0.0],
      },
    },
    {
      name: "Groovy",
      values: {
        u_speed: 0.7,
        u_blobSize: 0.4,
        u_color1: [0.8, 0.0, 0.8],
        u_color2: [0.0, 0.8, 0.8],
      },
    },
    {
      name: "Alien",
      values: {
        u_speed: 0.4,
        u_blobSize: 0.25,
        u_color1: [0.0, 1.0, 0.3],
        u_color2: [0.2, 0.5, 0.0],
      },
    },
    {
      name: "Sunset Glow",
      values: {
        u_speed: 0.6,
        u_blobSize: 0.35,
        u_color1: [1.0, 0.4, 0.2],
        u_color2: [1.0, 0.8, 0.3],
      },
    },
  ],
  Starfield: [
    {
      name: "Deep Space",
      values: {
        u_speed: 1.0,
        u_density: 0.8,
        u_brightness: 1.2,
        u_color: [0.8, 0.9, 1.0],
      },
    },
    {
      name: "Warp Speed",
      values: {
        u_speed: 3.0,
        u_density: 0.6,
        u_brightness: 1.5,
        u_color: [1.0, 1.0, 1.0],
      },
    },
    {
      name: "Nebula",
      values: {
        u_speed: 0.5,
        u_density: 1.0,
        u_brightness: 0.8,
        u_color: [0.8, 0.5, 1.0],
      },
    },
    {
      name: "Golden Galaxy",
      values: {
        u_speed: 0.8,
        u_density: 0.7,
        u_brightness: 1.0,
        u_color: [1.0, 0.9, 0.6],
      },
    },
  ],
  Tunnel: [
    {
      name: "Vortex",
      values: {
        u_speed: 1.5,
        u_twist: 2.0,
        u_zoom: 1.0,
        u_color1: [0.0, 0.5, 1.0],
        u_color2: [0.5, 0.0, 1.0],
      },
    },
    {
      name: "Hyperdrive",
      values: {
        u_speed: 3.0,
        u_twist: 1.0,
        u_zoom: 1.5,
        u_color1: [1.0, 1.0, 1.0],
        u_color2: [0.5, 0.5, 1.0],
      },
    },
    {
      name: "Psychedelic",
      values: {
        u_speed: 0.8,
        u_twist: 4.0,
        u_zoom: 0.8,
        u_color1: [1.0, 0.0, 0.5],
        u_color2: [0.0, 1.0, 0.5],
      },
    },
    {
      name: "Monochrome",
      values: {
        u_speed: 1.2,
        u_twist: 1.5,
        u_zoom: 1.2,
        u_color1: [0.9, 0.9, 0.9],
        u_color2: [0.1, 0.1, 0.1],
      },
    },
  ],
  "Grid Distortion": [
    {
      name: "Wave",
      values: {
        u_distortion: 0.5,
        u_frequency: 3.0,
        u_speed: 1.0,
        u_color: [0.0, 0.8, 1.0],
      },
    },
    {
      name: "Ripple",
      values: {
        u_distortion: 0.8,
        u_frequency: 5.0,
        u_speed: 0.5,
        u_color: [0.5, 0.0, 1.0],
      },
    },
    {
      name: "Glitch",
      values: {
        u_distortion: 1.2,
        u_frequency: 8.0,
        u_speed: 2.0,
        u_color: [1.0, 0.0, 0.5],
      },
    },
    {
      name: "Subtle",
      values: {
        u_distortion: 0.2,
        u_frequency: 2.0,
        u_speed: 0.3,
        u_color: [0.3, 0.3, 0.3],
      },
    },
  ],
  "Chromatic Waves": [
    {
      name: "Rainbow",
      values: {
        u_speed: 0.5,
        u_frequency: 3.0,
        u_amplitude: 0.5,
        u_saturation: 1.0,
      },
    },
    {
      name: "Pastel",
      values: {
        u_speed: 0.3,
        u_frequency: 2.0,
        u_amplitude: 0.3,
        u_saturation: 0.5,
      },
    },
    {
      name: "Vivid",
      values: {
        u_speed: 0.8,
        u_frequency: 4.0,
        u_amplitude: 0.7,
        u_saturation: 1.5,
      },
    },
    {
      name: "Muted",
      values: {
        u_speed: 0.4,
        u_frequency: 2.5,
        u_amplitude: 0.4,
        u_saturation: 0.3,
      },
    },
  ],
  "Glitch Effect": [
    {
      name: "TV Static",
      values: { u_intensity: 0.5, u_speed: 2.0, u_blockSize: 0.05 },
    },
    {
      name: "Digital Chaos",
      values: { u_intensity: 1.0, u_speed: 4.0, u_blockSize: 0.1 },
    },
    {
      name: "Subtle Noise",
      values: { u_intensity: 0.2, u_speed: 1.0, u_blockSize: 0.02 },
    },
    {
      name: "VHS",
      values: { u_intensity: 0.7, u_speed: 1.5, u_blockSize: 0.08 },
    },
  ],
  "Neon Grid": [
    {
      name: "Retrowave",
      values: {
        u_gridSize: 20.0,
        u_glowIntensity: 1.5,
        u_speed: 0.5,
        u_color: [1.0, 0.0, 0.8],
      },
    },
    {
      name: "Tron",
      values: {
        u_gridSize: 30.0,
        u_glowIntensity: 2.0,
        u_speed: 0.3,
        u_color: [0.0, 1.0, 1.0],
      },
    },
    {
      name: "Matrix",
      values: {
        u_gridSize: 15.0,
        u_glowIntensity: 1.2,
        u_speed: 0.8,
        u_color: [0.0, 1.0, 0.3],
      },
    },
    {
      name: "Vaporwave",
      values: {
        u_gridSize: 25.0,
        u_glowIntensity: 1.8,
        u_speed: 0.4,
        u_color: [0.8, 0.4, 1.0],
      },
    },
  ],
  Dithering: [
    {
      name: "Retro",
      values: {
        u_pattern: 0,
        u_ditherSize: 4.0,
        u_color1: [0.0, 0.0, 0.0],
        u_color2: [1.0, 1.0, 1.0],
      },
    },
    {
      name: "Amber",
      values: {
        u_pattern: 1,
        u_ditherSize: 3.0,
        u_color1: [0.1, 0.05, 0.0],
        u_color2: [1.0, 0.7, 0.2],
      },
    },
    {
      name: "Terminal",
      values: {
        u_pattern: 2,
        u_ditherSize: 2.0,
        u_color1: [0.0, 0.1, 0.0],
        u_color2: [0.2, 1.0, 0.3],
      },
    },
    {
      name: "Blueprint",
      values: {
        u_pattern: 3,
        u_ditherSize: 5.0,
        u_color1: [0.0, 0.1, 0.3],
        u_color2: [0.8, 0.9, 1.0],
      },
    },
  ],
  "Ripple Effect": [
    {
      name: "Water Drop",
      values: {
        u_speed: 0.5,
        u_frequency: 10.0,
        u_amplitude: 0.05,
        u_decay: 0.5,
      },
    },
    {
      name: "Shockwave",
      values: {
        u_speed: 1.5,
        u_frequency: 5.0,
        u_amplitude: 0.1,
        u_decay: 0.3,
      },
    },
    {
      name: "Gentle",
      values: {
        u_speed: 0.3,
        u_frequency: 15.0,
        u_amplitude: 0.02,
        u_decay: 0.7,
      },
    },
    {
      name: "Intense",
      values: {
        u_speed: 0.8,
        u_frequency: 8.0,
        u_amplitude: 0.08,
        u_decay: 0.4,
      },
    },
  ],
  Mandala: [
    {
      name: "Sacred",
      values: {
        u_segments: 8,
        u_speed: 0.3,
        u_complexity: 5.0,
        u_color1: [0.8, 0.6, 0.2],
        u_color2: [0.4, 0.2, 0.6],
      },
    },
    {
      name: "Kaleidoscope",
      values: {
        u_segments: 12,
        u_speed: 0.5,
        u_complexity: 8.0,
        u_color1: [1.0, 0.2, 0.5],
        u_color2: [0.2, 0.8, 0.5],
      },
    },
    {
      name: "Zen",
      values: {
        u_segments: 6,
        u_speed: 0.2,
        u_complexity: 3.0,
        u_color1: [0.9, 0.9, 0.9],
        u_color2: [0.3, 0.3, 0.3],
      },
    },
    {
      name: "Cosmic",
      values: {
        u_segments: 16,
        u_speed: 0.4,
        u_complexity: 10.0,
        u_color1: [0.0, 0.5, 1.0],
        u_color2: [1.0, 0.0, 0.5],
      },
    },
  ],
  "Volumetric Clouds": [
    {
      name: "Cumulus",
      values: {
        u_density: 0.5,
        u_coverage: 0.5,
        u_speed: 0.3,
        u_lightColor: [1.0, 0.95, 0.9],
      },
    },
    {
      name: "Storm",
      values: {
        u_density: 0.8,
        u_coverage: 0.7,
        u_speed: 0.6,
        u_lightColor: [0.6, 0.6, 0.7],
      },
    },
    {
      name: "Sunset",
      values: {
        u_density: 0.4,
        u_coverage: 0.4,
        u_speed: 0.2,
        u_lightColor: [1.0, 0.6, 0.3],
      },
    },
    {
      name: "Ethereal",
      values: {
        u_density: 0.3,
        u_coverage: 0.3,
        u_speed: 0.4,
        u_lightColor: [0.9, 0.8, 1.0],
      },
    },
  ],
  Sparkle: [
    {
      name: "Glitter",
      values: {
        u_density: 0.8,
        u_speed: 1.0,
        u_size: 0.02,
        u_color: [1.0, 1.0, 1.0],
      },
    },
    {
      name: "Fireflies",
      values: {
        u_density: 0.4,
        u_speed: 0.5,
        u_size: 0.04,
        u_color: [1.0, 0.9, 0.4],
      },
    },
    {
      name: "Stars",
      values: {
        u_density: 0.6,
        u_speed: 0.3,
        u_size: 0.01,
        u_color: [0.9, 0.95, 1.0],
      },
    },
    {
      name: "Magic",
      values: {
        u_density: 0.7,
        u_speed: 0.8,
        u_size: 0.03,
        u_color: [0.8, 0.5, 1.0],
      },
    },
  ],
  Mosaic: [
    {
      name: "Stained Glass",
      values: { u_tileSize: 30.0, u_gap: 2.0, u_randomness: 0.3 },
    },
    {
      name: "Pixel Art",
      values: { u_tileSize: 10.0, u_gap: 0.0, u_randomness: 0.0 },
    },
    {
      name: "Broken",
      values: { u_tileSize: 50.0, u_gap: 3.0, u_randomness: 0.8 },
    },
    {
      name: "Voronoi",
      values: { u_tileSize: 40.0, u_gap: 1.0, u_randomness: 0.5 },
    },
  ],
};

interface ControlPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  uniforms: Record<string, ShaderUniform>;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onApplyPreset: (values: Record<string, any>) => void;
  onBack: () => void;
  panelOpacity?: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onRandomize: () => void;
  onExportImage: (scale: number) => void;
  onStartRecording: (format: "mp4" | "webm" | "gif") => void;
  onStopRecording: () => void;
  isRecording: boolean;
  fps: number;
  shaderName?: string;
}

// Group uniforms by category based on naming patterns
function groupUniforms(uniforms: Record<string, ShaderUniform>) {
  const groups: Record<string, [string, ShaderUniform][]> = {
    Colors: [],
    Animation: [],
    Effects: [],
    Shape: [],
    Image: [],
    General: [],
  };

  const hiddenUniforms = [
    "u_time",
    "u_resolution",
    "u_mouse",
    "u_mousePressed",
  ];

  Object.entries(uniforms).forEach(([name, uniform]) => {
    if (hiddenUniforms.includes(name)) return;

    const nameLower = name.toLowerCase();

    if (uniform.type === "vec3" && uniform.isColor) {
      groups.Colors.push([name, uniform]);
    } else if (uniform.type === "sampler2D") {
      groups.Image.push([name, uniform]);
    } else if (
      nameLower.includes("speed") ||
      nameLower.includes("animate") ||
      nameLower.includes("frequency") ||
      nameLower.includes("time")
    ) {
      groups.Animation.push([name, uniform]);
    } else if (
      nameLower.includes("distortion") ||
      nameLower.includes("swirl") ||
      nameLower.includes("grain") ||
      nameLower.includes("glow") ||
      nameLower.includes("blur") ||
      nameLower.includes("noise")
    ) {
      groups.Effects.push([name, uniform]);
    } else if (
      nameLower.includes("size") ||
      nameLower.includes("scale") ||
      nameLower.includes("radius") ||
      nameLower.includes("width") ||
      nameLower.includes("height") ||
      nameLower.includes("pattern") ||
      nameLower.includes("shape")
    ) {
      groups.Shape.push([name, uniform]);
    } else {
      groups.General.push([name, uniform]);
    }
  });

  // Filter out empty groups and return
  return Object.entries(groups).filter(([_, items]) => items.length > 0);
}

// Format uniform name for display
function formatUniformName(name: string): string {
  return name
    .replace(/^u_/, "")
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Collapsible section component
function ControlSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 py-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors text-left"
      >
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 ml-2 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className=" text-left px-2"
          >
            <div className="pb-4 space-y-4 text-left">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Slider with number input
function SliderWithInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toFixed(step < 1 ? 2 : 0));
  }, [value, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toFixed(step < 1 ? 2 : 0));
    } else {
      setInputValue(value.toFixed(step < 1 ? 2 : 0));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground text-left">
          {label}
        </Label>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-16 h-7 text-xs text-right px-2 bg-muted/50 border-border/50"
        />
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="[&_[data-slot=slider-track]]:bg-muted [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:border-primary"
      />
    </div>
  );
}

// Simple color picker
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
}) {
  const [r, g, b] = value;
  const hexColor = `#${Math.round(r * 255)
    .toString(16)
    .padStart(2, "0")}${Math.round(g * 255)
    .toString(16)
    .padStart(2, "0")}${Math.round(b * 255)
    .toString(16)
    .padStart(2, "0")}`;

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const newR = parseInt(hex.slice(1, 3), 16) / 255;
    const newG = parseInt(hex.slice(3, 5), 16) / 255;
    const newB = parseInt(hex.slice(5, 7), 16) / 255;
    onChange([newR, newG, newB]);
  };

  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium text-foreground text-left">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono uppercase">
          {hexColor}
        </span>
        <div className="relative">
          <input
            type="color"
            value={hexColor}
            onChange={handleColorChange}
            className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
            style={{ padding: 0 }}
          />
        </div>
      </div>
    </div>
  );
}

// Pattern selector buttons
function PatternSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-foreground text-left">
        {label}
      </Label>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
              Math.round(value) === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Image upload component
function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: {
    type: string;
    image: HTMLImageElement | null;
    width: number;
    height: number;
  } | null;
  onChange: (value: any) => void;
}) {
  const hasImage = value?.image !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        onChange({
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
    <div className="space-y-2">
      <Label className="text-xs font-medium text-foreground text-left">
        {label}
      </Label>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className={cn(
            "flex items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 border-dashed transition-all cursor-pointer",
            hasImage
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary/30 hover:bg-muted/30"
          )}
        >
          {hasImage ? (
            <>
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary font-medium">
                {value?.width}×{value?.height}
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

export function ControlPanel({
  isOpen,
  onToggle,
  uniforms,
  values,
  onChange,
  onApplyPreset,
  onBack,
  panelOpacity: panelOpacityProp,
  isPlaying,
  onPlayPause,
  onReset,
  onRandomize,
  onExportImage,
  onStartRecording,
  onStopRecording,
  isRecording,
  fps,
  shaderName,
}: ControlPanelProps) {
  const groupedUniforms = groupUniforms(uniforms);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Get presets for current shader
  const shaderPresets = shaderName ? SHADER_PRESETS[shaderName] || [] : [];

  const handlePresetSelect = (preset: {
    name: string;
    values: Record<string, any>;
  }) => {
    setActivePreset(preset.name);
    onApplyPreset(preset.values);
  };

  // Pattern options for dithering shader
  const patternOptions = [
    { value: 0, label: "Wave" },
    { value: 1, label: "Spiral" },
    { value: 2, label: "Simplex" },
    { value: 3, label: "Orb" },
  ];

  // Dither type options
  const ditherTypeOptions = [
    { value: 0, label: "8×8" },
    { value: 1, label: "4×4" },
    { value: 2, label: "2×2" },
  ];

  // Fit mode options
  const fitModeOptions = [
    { value: 0, label: "Cover" },
    { value: 1, label: "Contain" },
    { value: 2, label: "Stretch" },
  ];

  // Get current pattern for conditional rendering
  const currentPattern = Math.round(values["u_pattern"] ?? 0);

  // Pattern-specific uniforms
  const patternSpecificUniforms: Record<number, string[]> = {
    0: ["u_waveHeight", "u_waveFrequency"],
    1: ["u_spiralArms", "u_spiralTightness", "u_spiralSize", "u_spiralCenter"],
    2: [],
    3: ["u_orbSize", "u_orbSoftness"],
  };

  const allPatternUniforms = Object.values(patternSpecificUniforms).flat();

  const shouldShowUniform = (name: string) => {
    if (allPatternUniforms.includes(name)) {
      return patternSpecificUniforms[currentPattern]?.includes(name);
    }
    return true;
  };

  const renderControl = (name: string, uniform: ShaderUniform) => {
    if (!shouldShowUniform(name)) return null;

    const value = values[name] ?? uniform.defaultValue;

    // Pattern selection
    if (name === "u_pattern" && uniform.type === "float") {
      return (
        <PatternSelector
          key={name}
          label="Pattern"
          options={patternOptions}
          value={value}
          onChange={(v) => onChange(name, v)}
        />
      );
    }

    // Dither type selection
    if (name === "u_ditherType" && uniform.type === "float") {
      return (
        <PatternSelector
          key={name}
          label="Dither Matrix"
          options={ditherTypeOptions}
          value={value}
          onChange={(v) => onChange(name, v)}
        />
      );
    }

    // Fit mode selection
    if (name === "u_fitMode" && uniform.type === "float") {
      return (
        <PatternSelector
          key={name}
          label="Image Fit"
          options={fitModeOptions}
          value={value}
          onChange={(v) => onChange(name, v)}
        />
      );
    }

    // Animate toggle
    if (name === "u_animate" && uniform.type === "float") {
      return (
        <div key={name} className="flex items-center justify-between">
          <Label className="text-xs font-medium">Animate Dither</Label>
          <Switch
            checked={value > 0.5}
            onCheckedChange={(checked) => onChange(name, checked ? 1.0 : 0.0)}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      );
    }

    // Float slider
    if (uniform.type === "float") {
      return (
        <SliderWithInput
          key={name}
          label={formatUniformName(name)}
          value={value}
          onChange={(v) => onChange(name, v)}
          min={uniform.min}
          max={uniform.max}
          step={uniform.step}
        />
      );
    }

    // Color picker
    if (uniform.type === "vec3" && uniform.isColor) {
      return (
        <ColorPicker
          key={name}
          label={formatUniformName(name)}
          value={value}
          onChange={(v) => onChange(name, v)}
        />
      );
    }

    // Boolean switch
    if (uniform.type === "bool") {
      return (
        <div key={name} className="flex items-center justify-between">
          <Label className="text-xs font-medium">
            {formatUniformName(name)}
          </Label>
          <Switch
            checked={value}
            onCheckedChange={(checked) => onChange(name, checked)}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      );
    }

    // Vec2 control
    if (uniform.type === "vec2") {
      return (
        <div key={name} className="space-y-2">
          <Label className="text-xs font-medium">
            {formatUniformName(name)}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <SliderWithInput
              label="X"
              value={value[0]}
              onChange={(v) => onChange(name, [v, value[1]])}
              min={0}
              max={1}
              step={0.01}
            />
            <SliderWithInput
              label="Y"
              value={value[1]}
              onChange={(v) => onChange(name, [value[0], v])}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      );
    }

    // Texture upload
    if (uniform.type === "sampler2D") {
      return (
        <ImageUpload
          key={name}
          label={formatUniformName(name)}
          value={value}
          onChange={(v) => onChange(name, v)}
        />
      );
    }

    return null;
  };

  // Clamp panel opacity (0–1)
  const panelOpacity = Math.min(Math.max(panelOpacityProp ?? 0.95, 0), 1);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 right-4 z-50 p-2.5 rounded-xl",
          "bg-card/90 backdrop-blur-md border border-border shadow-lg",
          "hover:bg-card transition-colors",
          isOpen && "opacity-0 pointer-events-none"
        )}
        title="Open Controls"
      >
        <PanelRight className="size-4" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col bg-card backdrop-blur-xl border-l border-border shadow-2xl"
            style={{
              backgroundColor: `color-mix(in srgb, var(--card) ${
                panelOpacity * 100
              }%, transparent)`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Back</span>
              </Button>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <PanelRight className="size-4" />
              </button>
            </div>

            {/* Export Buttons */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex gap-2">
                {/* Image Export Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 w-full rounded-lg shadow-none"
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                      Export Image
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel className="text-xs">
                      Resolution Scale
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onExportImage(0.5)}>
                      <span className="mr-auto">0.5x</span>
                      <span className="text-xs text-muted-foreground">
                        Half size
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExportImage(1)}>
                      <span className="mr-auto">1x</span>
                      <span className="text-xs text-muted-foreground">
                        Original
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExportImage(2)}>
                      <span className="mr-auto">2x</span>
                      <span className="text-xs text-muted-foreground">
                        Double size
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Video Record Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isRecording ? "destructive" : "secondary"}
                      size="sm"
                      className="flex-1 w-full rounded-lg shadow-none"
                    >
                      <Video
                        className={cn(
                          "h-3.5 w-3.5 mr-1.5",
                          isRecording && "animate-pulse"
                        )}
                      />
                      {isRecording ? "Recording..." : "Record"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {isRecording ? (
                      <DropdownMenuItem onClick={onStopRecording}>
                        <span className="text-destructive">Stop Recording</span>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuLabel className="text-xs">
                          Format
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onStartRecording("mp4")}
                        >
                          <span className="mr-auto">MP4</span>
                          <span className="text-xs text-muted-foreground">
                            Best quality
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onStartRecording("webm")}
                        >
                          <span className="mr-auto">WebM</span>
                          <span className="text-xs text-muted-foreground">
                            Web friendly
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onStartRecording("gif")}
                        >
                          <span className="mr-auto">GIF</span>
                          <span className="text-xs text-muted-foreground">
                            Animated image
                          </span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Playback Controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPlayPause}
                  className="flex-1 w-full rounded-lg shadow-none"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5 mr-1.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  title="Reset"
                  className="flex-1 w-full rounded-lg shadow-none"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRandomize}
                  title="Randomize"
                  className="flex-1 w-full rounded-lg shadow-none"
                >
                  <Shuffle className="h-3.5 w-3.5 mr-1.5" />
                  Shuffle
                </Button>
              </div>

              {/* Presets */}
              {shaderPresets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    Presets
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {shaderPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                          activePreset === preset.name
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Controls */}
            <div className="flex-1 overflow-y-auto p-4">
              {groupedUniforms.map(([groupName, items]) => (
                <ControlSection key={groupName} title={groupName}>
                  {items.map(([name, uniform]) => renderControl(name, uniform))}
                </ControlSection>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                FPS: {fps}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
