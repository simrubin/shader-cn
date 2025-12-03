// Export types
export type { ShaderPreset } from "./types";

// Organic shaders
export { simplexFlow } from "./simplex-flow";
export { rippleEffect } from "./ripple-effect";
export { auroraBorealis } from "./aurora-borealis";
export { lavaLamp } from "./lava-lamp";
export { meshGradient } from "./mesh-gradient";

// 3D shaders
export { tutorialSphere } from "./tutorial-sphere";
export { tunnel } from "./tunnel";
export { starfield } from "./starfield";
export { neonGrid } from "./neon-grid";
export { volumetricClouds } from "./volumetric-clouds";

// Geometric shaders
export { gridDistortion } from "./grid-distortion";
export { mandala } from "./mandala";
export { mosaic } from "./mosaic";

// Effects shaders
export { chromaticWaves } from "./chromatic-waves";
export { glitchEffect } from "./glitch-effect";
export { matrixRain } from "./matrix-rain";
export { sparkle } from "./sparkle";

// Dithering shaders
export { dithering } from "./dithering";
export { imageDithering } from "./image-dithering";

// React component shaders (from @paper-design/shaders-react)
export {
  MeshGradient,
  LayeredMeshGradient,
  type MeshGradientProps,
  type LayeredMeshGradientProps,
} from "./components/mesh-gradient";

// Combined array export
import { simplexFlow } from "./simplex-flow";
import { rippleEffect } from "./ripple-effect";
import { auroraBorealis } from "./aurora-borealis";
import { lavaLamp } from "./lava-lamp";
import { meshGradient } from "./mesh-gradient";
import { tutorialSphere } from "./tutorial-sphere";
import { tunnel } from "./tunnel";
import { starfield } from "./starfield";
import { neonGrid } from "./neon-grid";
import { volumetricClouds } from "./volumetric-clouds";
import { gridDistortion } from "./grid-distortion";
import { mandala } from "./mandala";
import { mosaic } from "./mosaic";
import { chromaticWaves } from "./chromatic-waves";
import { glitchEffect } from "./glitch-effect";
import { matrixRain } from "./matrix-rain";
import { sparkle } from "./sparkle";
import { dithering } from "./dithering";
import { imageDithering } from "./image-dithering";

export const allShaderPresets = [
  // Organic
  { ...simplexFlow, image: "/shader-imgs/simplex-flow.png" },
  { ...rippleEffect, image: "/shader-imgs/ripple-effect.png" },
  { ...auroraBorealis, image: "/shader-imgs/aurora-borealis.png" },
  { ...lavaLamp, image: "/shader-imgs/lava-lamp.png" },
  { ...meshGradient, image: "/shader-imgs/mesh-gradient.png" },

  // 3D
  { ...tutorialSphere, image: "/shader-imgs/tutorial-sphere.png" },
  { ...tunnel, image: "/shader-imgs/tunnel.png" },
  { ...starfield, image: "/shader-imgs/starfield.png" },
  { ...neonGrid, image: "/shader-imgs/neon-grid.png" },
  { ...volumetricClouds, image: "/shader-imgs/volumetric-clouds.png" },

  // Geometric
  { ...gridDistortion, image: "/shader-imgs/grid-distortion.png" },
  { ...mandala, image: "/shader-imgs/mandala.png" },
  { ...mosaic, image: "/shader-imgs/mosaic.png" },

  // Effects
  { ...chromaticWaves, image: "/shader-imgs/chromatic-waves.png" },
  { ...glitchEffect, image: "/shader-imgs/glitch-effect.png" },
  { ...matrixRain, image: "/shader-imgs/matrix-rain.png" },
  { ...sparkle, image: "/shader-imgs/sparkle.png" },

  // Dithering
  { ...dithering, image: "/shader-imgs/dithering.png" },
  { ...imageDithering, image: "/shader-imgs/image-dithering.png" },
];
