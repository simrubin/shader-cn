"use client";

import { MeshGradient as PaperMeshGradient } from "@paper-design/shaders-react";
import { useMemo } from "react";

// ===== PROPS INTERFACE =====
export interface MeshGradientProps {
  /** Array of colors in hex format (up to 10) */
  colors?: string[];
  /** Animation speed multiplier (default: 0.3) */
  speed?: number;
  /** Enable wireframe mode */
  wireframe?: boolean;
  /** Warp distortion amount (0-1, default: 0.2) */
  distortion?: number;
  /** Vortex/swirl distortion (0-0.5, default: 0.1) */
  swirl?: number;
  /** Shape distortion via grain mixing (0-1, default: 0) */
  grainMixer?: number;
  /** Post-processing grain overlay (0-0.2, default: 0.02) */
  grainOverlay?: number;
  /** CSS class name */
  className?: string;
  /** CSS styles */
  style?: React.CSSProperties;
}

// ===== DEFAULT COLORS (matching 21st.dev Paper Design) =====
const defaultColors = [
  "#000000",
  "#06b6d4", // Cyan
  "#0891b2",
  "#164e63",
  "#f97316", // Orange
];

// ===== MAIN COMPONENT =====
export function MeshGradient({
  colors = defaultColors,
  speed = 0.3,
  wireframe = false,
  distortion = 0.2,
  swirl = 0.1,
  grainMixer = 0,
  grainOverlay = 0.02,
  className = "",
  style,
}: MeshGradientProps) {
  return (
    <PaperMeshGradient
      className={className}
      style={style}
      colors={colors}
      speed={speed}
      wireframe={wireframe}
      distortion={distortion}
      swirl={swirl}
      grainMixer={grainMixer}
      grainOverlay={grainOverlay}
    />
  );
}

// ===== LAYERED MESH GRADIENT (combines solid + wireframe) =====
export interface LayeredMeshGradientProps {
  /** Primary colors for solid layer */
  colors?: string[];
  /** Wireframe layer colors */
  wireframeColors?: string[];
  /** Animation speed */
  speed?: number;
  /** Show wireframe overlay (default: true) */
  showWireframe?: boolean;
  /** Wireframe opacity (0-1) */
  wireframeOpacity?: number;
  /** Distortion amount */
  distortion?: number;
  /** Swirl amount */
  swirl?: number;
  /** Grain overlay amount */
  grainOverlay?: number;
  /** CSS class name */
  className?: string;
  /** CSS styles */
  style?: React.CSSProperties;
}

export function LayeredMeshGradient({
  colors = ["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"],
  wireframeColors = ["#000000", "#ffffff", "#06b6d4", "#f97316", "#000000"],
  speed = 0.3,
  showWireframe = true,
  wireframeOpacity = 0.5,
  distortion = 0.2,
  swirl = 0.1,
  grainOverlay = 0.02,
  className = "",
  style,
}: LayeredMeshGradientProps) {
  return (
    <div className={`relative ${className}`} style={style}>
      {/* Base solid gradient */}
      <PaperMeshGradient
        className="absolute inset-0 w-full h-full"
        colors={colors}
        speed={speed}
        distortion={distortion}
        swirl={swirl}
        grainOverlay={grainOverlay}
      />
      
      {/* Wireframe overlay */}
      {showWireframe && (
        <PaperMeshGradient
          className="absolute inset-0 w-full h-full"
          style={{ opacity: wireframeOpacity }}
          colors={wireframeColors}
          speed={speed * 0.7}
          wireframe
          distortion={distortion * 0.8}
          swirl={swirl * 0.5}
        />
      )}
    </div>
  );
}

export default MeshGradient;
