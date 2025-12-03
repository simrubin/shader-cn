import { ShaderPreset } from "./types";

// Actual mesh gradient shader from @paper-design/shaders, adapted for WebGL1
// This produces the same visual output as the React component

export const meshGradient: ShaderPreset = {
  name: "Mesh Gradient",
  description:
    "Flowing mesh gradient with organic color blending (from @paper-design/shaders)",
  category: "Organic",
  code: `precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// Configurable uniforms
uniform float u_speed; // default: 0.5, min: 0.0, max: 2.0, step: 0.05
uniform float u_distortion; // default: 0.15, min: 0.0, max: 1.0, step: 0.01
uniform float u_swirl; // default: 0.1, min: 0.0, max: 0.5, step: 0.01
uniform float u_grainMixer; // default: 0.0, min: 0.0, max: 1.0, step: 0.01
uniform float u_grainOverlay; // default: 0.03, min: 0.0, max: 0.2, step: 0.005

// Colors (bright pastels)
uniform vec3 u_color1; // color, default: [1.0, 0.85, 0.9]
uniform vec3 u_color2; // color, default: [0.6, 0.9, 1.0]
uniform vec3 u_color3; // color, default: [0.85, 0.7, 1.0]
uniform vec3 u_color4; // color, default: [1.0, 0.95, 0.7]
uniform vec3 u_color5; // color, default: [0.7, 1.0, 0.85]

#define PI 3.14159265358979323846
#define MAX_COLORS 5

// Rotation matrix
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

// Hash function for procedural noise
float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

// Value noise
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float noise(vec2 n, vec2 seedOffset) {
  return valueNoise(n + seedOffset);
}

// Get animated position for each color blob
vec2 getPosition(int i, float t) {
  float a = float(i) * 0.37;
  float b = 0.6 + fract(float(i) / 3.0) * 0.9;
  float c = 0.8 + fract(float(i + 1) / 4.0);
  
  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);
  
  return 0.5 + 0.5 * vec2(x, y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= 0.5; // Center UV
  
  vec2 grainUV = uv * 1000.0;
  
  float grain = noise(grainUV, vec2(0.0));
  float mixerGrain = 0.4 * u_grainMixer * (grain - 0.5);
  
  // Time with offset for interesting starting position
  float t = u_speed * (u_time + 41.5);
  
  // Distortion based on distance from center
  float radius = smoothstep(0.0, 1.0, length(uv));
  float center = 1.0 - radius;
  
  vec2 distortedUV = uv;
  for (float i = 1.0; i <= 2.0; i++) {
    distortedUV.x += u_distortion * center / i * sin(t + i * 0.4 * smoothstep(0.0, 1.0, uv.y)) * cos(0.2 * t + i * 2.4 * smoothstep(0.0, 1.0, uv.y));
    distortedUV.y += u_distortion * center / i * cos(t + i * 2.0 * smoothstep(0.0, 1.0, uv.x));
  }
  
  // Swirl rotation
  vec2 uvRotated = distortedUV;
  float angle = 3.0 * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += 0.5; // Shift back to 0-1 range
  
  // Color blending using inverse distance weighting
  vec3 colors[5];
  colors[0] = u_color1;
  colors[1] = u_color2;
  colors[2] = u_color3;
  colors[3] = u_color4;
  colors[4] = u_color5;
  
  vec3 color = vec3(0.0);
  float totalWeight = 0.0;
  
  for (int i = 0; i < MAX_COLORS; i++) {
    vec2 pos = getPosition(i, t) + mixerGrain;
    
    float dist = length(uvRotated - pos);
    dist = pow(dist, 3.5);
    float weight = 1.0 / (dist + 0.001);
    
    color += colors[i] * weight;
    totalWeight += weight;
  }
  
  color /= max(0.0001, totalWeight);
  
  // Grain overlay
  float grainOverlayValue = valueNoise(rotate(grainUV, 1.0) + vec2(3.0));
  grainOverlayValue = mix(grainOverlayValue, valueNoise(rotate(grainUV, 2.0) + vec2(-1.0)), 0.5);
  grainOverlayValue = pow(grainOverlayValue, 1.3);
  
  float grainOverlayV = grainOverlayValue * 2.0 - 1.0;
  vec3 grainOverlayColor = vec3(step(0.0, grainOverlayV));
  float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, 0.8);
  color = mix(color, grainOverlayColor, 0.35 * grainOverlayStrength);
  
  gl_FragColor = vec4(color, 1.0);
}`,
};
