"use client";

import { useState } from "react";
import { DitheringCanvas, DitheringPattern } from "@/components/dithering-canvas";

type PatternInfo = {
  id: DitheringPattern;
  name: string;
};

const patterns: PatternInfo[] = [
  { id: "wave", name: "Wave" },
  { id: "spiral", name: "Spiral" },
  { id: "simplex", name: "Simplex" },
  { id: "orb", name: "Orb" },
];

// Preset color combinations
const colorPresets = [
  { name: "Pink/Dark", color1: [0.96, 0.2, 0.55] as [number, number, number], color2: [0.1, 0.08, 0.12] as [number, number, number] },
  { name: "Cyan/Purple", color1: [0.0, 0.9, 0.9] as [number, number, number], color2: [0.15, 0.08, 0.18] as [number, number, number] },
  { name: "Yellow/Brown", color1: [1.0, 0.9, 0.2] as [number, number, number], color2: [0.2, 0.1, 0.08] as [number, number, number] },
  { name: "Green/Dark", color1: [0.2, 0.9, 0.4] as [number, number, number], color2: [0.05, 0.1, 0.08] as [number, number, number] },
  { name: "Orange/Navy", color1: [1.0, 0.5, 0.1] as [number, number, number], color2: [0.08, 0.1, 0.18] as [number, number, number] },
  { name: "White/Black", color1: [1.0, 1.0, 1.0] as [number, number, number], color2: [0.0, 0.0, 0.0] as [number, number, number] },
];

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ];
  }
  return [1, 1, 1];
}

export default function DitherPage() {
  const [selectedPattern, setSelectedPattern] = useState<DitheringPattern>("wave");
  const [pixelSize, setPixelSize] = useState(4);
  const [speed, setSpeed] = useState(0.5);
  const [color1, setColor1] = useState<[number, number, number]>([0.96, 0.2, 0.55]);
  const [color2, setColor2] = useState<[number, number, number]>([0.1, 0.08, 0.12]);
  const [mouseRadius, setMouseRadius] = useState(0.15);
  const [mouseStrength, setMouseStrength] = useState(0.3);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Full-screen shader canvas */}
      <DitheringCanvas
        pattern={selectedPattern}
        pixelSize={pixelSize}
        speed={speed}
        color1={color1}
        color2={color2}
        mouseRadius={mouseRadius}
        mouseStrength={mouseStrength}
        className="absolute inset-0"
      />
      
      {/* Floating UI Panel */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Compact control panel */}
          <div 
            className="rounded-2xl backdrop-blur-xl border border-white/10 p-5"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Pattern Selection */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-white/50 uppercase tracking-wider mr-2">Pattern</span>
              {patterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPattern(p.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${selectedPattern === p.id 
                      ? "bg-white text-black" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                    }
                  `}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Color Selection */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 uppercase tracking-wider">Colors</span>
                <input
                  type="color"
                  value={rgbToHex(...color1)}
                  onChange={(e) => setColor1(hexToRgb(e.target.value))}
                  className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white/20"
                  style={{ backgroundColor: rgbToHex(...color1) }}
                />
                <input
                  type="color"
                  value={rgbToHex(...color2)}
                  onChange={(e) => setColor2(hexToRgb(e.target.value))}
                  className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white/20"
                  style={{ backgroundColor: rgbToHex(...color2) }}
                />
              </div>
              
              {/* Color Presets */}
              <div className="flex items-center gap-1">
                {colorPresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setColor1(preset.color1);
                      setColor2(preset.color2);
                    }}
                    className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${rgbToHex(...preset.color1)} 50%, ${rgbToHex(...preset.color2)} 50%)`,
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Sliders Row */}
            <div className="grid grid-cols-4 gap-4">
              {/* Pixel Size */}
              <div>
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Pixels</span>
                  <span className="text-white/70">{pixelSize}px</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={pixelSize}
                  onChange={(e) => setPixelSize(Number(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/20"
                />
              </div>

              {/* Speed */}
              <div>
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Speed</span>
                  <span className="text-white/70">{speed.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/20"
                />
              </div>

              {/* Mouse Radius */}
              <div>
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Radius</span>
                  <span className="text-white/70">{(mouseRadius * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={mouseRadius}
                  onChange={(e) => setMouseRadius(Number(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/20"
                />
              </div>

              {/* Mouse Strength */}
              <div>
                <label className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Repel</span>
                  <span className="text-white/70">{(mouseStrength * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={mouseStrength}
                  onChange={(e) => setMouseStrength(Number(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div 
        className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm pointer-events-none"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          color: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(8px)",
        }}
      >
        Move your mouse to repel pixels
      </div>
    </div>
  );
}
