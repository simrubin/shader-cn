import { ShaderPreset } from "./types";

export const dithering: ShaderPreset = {
  name: "Dithering",
  description: "Minimalist dithered patterns with mouse interaction",
  category: "Effects",
  code: `uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform float u_pattern; // default: 0.0, min: 0.0, max: 3.0, step: 1.0
uniform float u_pixelSize; // default: 4.0, min: 2.0, max: 12.0, step: 1.0
uniform float u_speed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_mouseRadius; // default: 0.15, min: 0.0, max: 0.5, step: 0.01
uniform float u_mouseStrength; // default: 0.3, min: 0.0, max: 1.0, step: 0.05
uniform vec3 u_color1; // color, default: [0.96, 0.2, 0.55]
uniform vec3 u_color2; // color, default: [0.1, 0.08, 0.12]

// Pattern-specific controls
uniform float u_waveHeight; // default: 0.3, min: 0.05, max: 0.6, step: 0.01
uniform float u_waveFrequency; // default: 3.0, min: 1.0, max: 10.0, step: 0.5
uniform float u_spiralArms; // default: 4.0, min: 1.0, max: 8.0, step: 1.0
uniform float u_spiralTightness; // default: 6.0, min: 2.0, max: 15.0, step: 0.5
uniform float u_spiralSize; // default: 0.6, min: 0.2, max: 1.0, step: 0.05
uniform float u_spiralCenter; // default: 0.15, min: 0.0, max: 1.0, step: 0.01
uniform float u_orbSize; // default: 0.25, min: 0.1, max: 0.5, step: 0.01
uniform float u_orbSoftness; // default: 0.15, min: 0.01, max: 0.3, step: 0.01

// Compute Bayer 8x8 dithering threshold (WebGL 1 compatible)
float getBayer(vec2 coord) {
  vec2 p = floor(mod(coord, 8.0));
  float v = 0.0;
  float scale = 32.0;
  for (int i = 0; i < 3; i++) {
    vec2 b = floor(p / 2.0);
    float m = mod(p.x, 2.0) + mod(p.y, 2.0) * 2.0;
    if (m < 0.5) v += 0.0;
    else if (m < 1.5) v += 2.0 * scale;
    else if (m < 2.5) v += 3.0 * scale;
    else v += 1.0 * scale;
    scale /= 4.0;
    p = b;
  }
  return v / 64.0;
}

// Apply dithering to blend between two colors
vec3 ditherBlend(float value, vec2 pixelCoord, vec3 col1, vec3 col2) {
  float threshold = getBayer(pixelCoord);
  float blend = step(threshold, value);
  return mix(col2, col1, blend);
}

// Pattern 0: Wave - horizontal gradient with animated wave (top to bottom)
float patternWave(vec2 uv, float time) {
  float wave = sin(uv.x * u_waveFrequency + time) * u_waveHeight;
  return smoothstep(0.3, 0.7, (1.0 - uv.y) + wave);
}

// Pattern 1: Spiral - spiral arms from center (like reference image)
float patternSpiral(vec2 uv, float time) {
  vec2 centered = uv - 0.5;
  centered.x *= u_resolution.x / u_resolution.y;
  
  float dist = length(centered);
  float angle = atan(centered.y, centered.x);
  
  // Create spiral arms that wind outward
  float spiral = angle + dist * u_spiralTightness - time * 1.5;
  float arms = sin(spiral * u_spiralArms) * 0.5 + 0.5;
  
  // Add concentric ring modulation
  float rings = sin(dist * 15.0 - time * 2.0) * 0.3 + 0.7;
  
  // Combine arms with rings
  float pattern = arms * rings;
  
  // Fade out from center and edges
  float centerFade = smoothstep(0.0, u_spiralCenter, dist);
  float edgeFade = smoothstep(u_spiralSize + 0.1, u_spiralSize - 0.1, dist);
  
  return pattern * centerFade * edgeFade;
}

// Pattern 2: Simplex - radial gradient with corner glow
float patternSimplex(vec2 uv, float time) {
  vec2 centered = uv - 0.5;
  centered.x *= u_resolution.x / u_resolution.y;
  float dist = length(centered);
  
  // Corner glow
  float corners = 0.0;
  corners += smoothstep(0.8, 0.0, length(uv - vec2(0.0, 0.0)));
  corners += smoothstep(0.8, 0.0, length(uv - vec2(1.0, 0.0)));
  corners += smoothstep(0.8, 0.0, length(uv - vec2(0.0, 1.0)));
  corners += smoothstep(0.8, 0.0, length(uv - vec2(1.0, 1.0)));
  
  float center = 1.0 - smoothstep(0.0, 0.5, dist);
  return max(corners * 0.5, 0.0) * (1.0 - center) + sin(time * 0.5) * 0.05;
}

// Pattern 3: Orb - pulsing center orb
float patternOrb(vec2 uv, float time) {
  vec2 centered = uv - 0.5;
  centered.x *= u_resolution.x / u_resolution.y;
  float dist = length(centered);
  float pulse = sin(time) * 0.03 + u_orbSize;
  return 1.0 - smoothstep(pulse - u_orbSoftness, pulse + u_orbSoftness, dist);
}

void main() {
  // Pixelate coordinates
  vec2 pixelCoord = floor(gl_FragCoord.xy / u_pixelSize);
  vec2 uv = (pixelCoord * u_pixelSize) / u_resolution;
  
  // Mouse interaction - repel pixels away from mouse
  vec2 mousePos = u_mouse;
  vec2 toMouse = uv - mousePos;
  toMouse.x *= u_resolution.x / u_resolution.y;
  float mouseDist = length(toMouse);
  
  // Repulsion effect - push UVs away from mouse
  if (mouseDist < u_mouseRadius && u_mouseRadius > 0.0) {
    vec2 repelDir = normalize(toMouse);
    float repelStrength = (1.0 - mouseDist / u_mouseRadius) * u_mouseStrength;
    uv += repelDir * repelStrength * 0.1;
  }
  
  float time = u_time * u_speed;
  float value = 0.0;
  
  // Select pattern based on uniform
  int pat = int(u_pattern);
  if (pat == 0) {
    value = patternWave(uv, time);
  } else if (pat == 1) {
    value = patternSpiral(uv, time);
  } else if (pat == 2) {
    value = patternSimplex(uv, time);
  } else {
    value = patternOrb(uv, time);
  }
  
  // Apply dithering
  vec3 color = ditherBlend(value, pixelCoord, u_color1, u_color2);
  
  gl_FragColor = vec4(color, 1.0);
}`,
};
