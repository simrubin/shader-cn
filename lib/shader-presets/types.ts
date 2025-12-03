export interface ShaderPreset {
  name: string;
  description: string;
  category: "Organic" | "3D" | "Geometric" | "Effects";
  code: string;
  vertexShader?: string; // Optional: For R3F/Mesh mode
  mode?: "canvas" | "mesh" | "fullscreen"; // Default to 'canvas', 'fullscreen' uses R3F for 2D shaders
  image?: string;
}
