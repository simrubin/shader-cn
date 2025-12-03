export interface ShaderPreset {
  name: string;
  description: string;
  category: "Organic" | "3D" | "Geometric" | "Effects";
  code: string;
  vertexShader?: string; // Optional: For R3F/Mesh mode
  mode?: "canvas" | "mesh" | "fullscreen" | "component"; // 'component' = React component (e.g. @paper-design/shaders-react)
  image?: string;
}
