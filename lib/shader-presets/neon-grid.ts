import { ShaderPreset } from "./types";

export const neonGrid: ShaderPreset = {
  name: "Neon Grid",
  description: "Retro neon grid perspective",
  category: "3D",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_gridSize; // default: 20.0, min: 5.0, max: 50.0, step: 1.0
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_perspective; // default: 2.0, min: 0.5, max: 5.0, step: 0.1
uniform float u_horizon; // default: 0.3, min: 0.0, max: 0.8, step: 0.05
uniform float u_lineWidth; // default: 0.05, min: 0.01, max: 0.2, step: 0.01
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_gridColor; // color, default: [0.0, 1.0, 1.0]
uniform vec3 u_horizonColor; // color, default: [1.0, 0.0, 1.0]
uniform vec3 u_skyColor; // color, default: [0.1, 0.0, 0.2]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    vec3 color = u_skyColor;
    
    if(uv.y < u_horizon) {
        float depth = (u_horizon - uv.y) / u_horizon;
        depth = pow(depth, u_perspective);
        
        vec2 gridUV = vec2(uv.x - 0.5, u_time * u_speed) / depth;
        gridUV *= u_gridSize;
        
        vec2 grid = abs(fract(gridUV) - 0.5);
        float line = min(grid.x, grid.y);
        float gridLine = smoothstep(u_lineWidth, 0.0, line);
        
        vec3 gridCol = mix(u_gridColor, u_horizonColor, 1.0 - depth);
        gridCol *= (1.0 + u_glow * gridLine);
        
        color = mix(color, gridCol, gridLine * depth);
    } else {
        float horizonGlow = exp(-(uv.y - u_horizon) * 5.0) * u_glow;
        color += u_horizonColor * horizonGlow;
    }
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

