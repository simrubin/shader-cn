import { ShaderPreset } from "./types";

export const gridDistortion: ShaderPreset = {
  name: "Grid Distortion",
  description: "Animated distorted grid",
  category: "Geometric",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_gridSize; // default: 20.0, min: 5.0, max: 50.0, step: 1.0
uniform float u_waveAmount; // default: 0.1, min: 0.0, max: 0.5, step: 0.01
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_waveFrequency; // default: 10.0, min: 1.0, max: 30.0, step: 0.5
uniform float u_lineThickness; // default: 0.95, min: 0.8, max: 0.99, step: 0.01
uniform float u_glow; // default: 0.0, min: 0.0, max: 1.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_lineColor; // color, default: [0.0, 1.0, 1.0]
uniform vec3 u_bgColor; // color, default: [0.0, 0.0, 0.1]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    uv.x += sin(uv.y * u_waveFrequency + u_time * u_speed) * u_waveAmount;
    uv.y += cos(uv.x * u_waveFrequency + u_time * u_speed) * u_waveAmount;
    
    vec2 grid = fract(uv * u_gridSize);
    float line = step(u_lineThickness, max(grid.x, grid.y));
    
    vec3 color = mix(u_bgColor, u_lineColor, line);
    
    if(u_glow > 0.0) {
        float dist = min(grid.x, grid.y);
        color += u_lineColor * u_glow * (1.0 - smoothstep(0.0, 0.1, dist));
    }
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

