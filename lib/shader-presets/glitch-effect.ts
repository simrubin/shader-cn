import { ShaderPreset } from "./types";

export const glitchEffect: ShaderPreset = {
  name: "Glitch Effect",
  description: "Digital glitch distortion",
  category: "Effects",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_glitchAmount; // default: 0.5, min: 0.0, max: 1.0, step: 0.05
uniform float u_glitchSpeed; // default: 5.0, min: 0.0, max: 20.0, step: 0.5
uniform float u_blockSize; // default: 20.0, min: 5.0, max: 100.0, step: 5.0
uniform float u_rgbShift; // default: 0.02, min: 0.0, max: 0.1, step: 0.005
uniform float u_scanlines; // default: 0.3, min: 0.0, max: 1.0, step: 0.1
uniform float u_noise; // default: 0.1, min: 0.0, max: 0.5, step: 0.05
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_baseColor; // color, default: [0.0, 1.0, 0.5]

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float glitch = step(0.9, random(vec2(floor(u_time * u_glitchSpeed))));
    float blockY = floor(uv.y * u_blockSize) / u_blockSize;
    float shift = (random(vec2(blockY, floor(u_time * u_glitchSpeed))) - 0.5) * u_glitchAmount * glitch;
    
    vec2 uvR = uv + vec2(shift + u_rgbShift, 0.0);
    vec2 uvG = uv + vec2(shift, 0.0);
    vec2 uvB = uv + vec2(shift - u_rgbShift, 0.0);
    
    float r = sin(uvR.x * 10.0 + u_time) * 0.5 + 0.5;
    float g = sin(uvG.y * 10.0 + u_time) * 0.5 + 0.5;
    float b = cos(uvB.x * 8.0 - u_time) * 0.5 + 0.5;
    
    vec3 color = vec3(r, g, b) * u_baseColor;
    
    float scanline = sin(uv.y * u_resolution.y * 2.0) * u_scanlines;
    color *= 1.0 - scanline;
    
    float noise = (random(uv + u_time) - 0.5) * u_noise;
    color += noise;
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

