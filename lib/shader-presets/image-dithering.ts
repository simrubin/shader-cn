import { ShaderPreset } from "./types";

export const imageDithering: ShaderPreset = {
  name: "Image Dithering",
  description: "Upload an image to apply dual-color Bayer dithering with configurable colors and pixel size",
  category: "Effects",
  mode: "fullscreen",
  code: `uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D u_image;
uniform vec2 u_imageResolution;

// Dither controls
uniform float u_pixelSize; // default: 4.0, min: 1.0, max: 16.0, step: 1.0
uniform float u_threshold; // default: 0.5, min: 0.0, max: 1.0, step: 0.01
uniform float u_contrast; // default: 1.0, min: 0.5, max: 2.0, step: 0.05

// Colors
uniform vec3 u_color1; // color, default: [1.0, 1.0, 1.0]
uniform vec3 u_color2; // color, default: [0.0, 0.0, 0.0]

// Dither pattern type
uniform float u_ditherType; // default: 0.0, min: 0.0, max: 2.0, step: 1.0

// Image sizing
uniform float u_fitMode; // default: 0.0, min: 0.0, max: 2.0, step: 1.0
uniform float u_imageScale; // default: 1.0, min: 0.1, max: 3.0, step: 0.05
uniform float u_offsetX; // default: 0.0, min: -1.0, max: 1.0, step: 0.01
uniform float u_offsetY; // default: 0.0, min: -1.0, max: 1.0, step: 0.01

// Animation
uniform float u_animate; // default: 0.0, min: 0.0, max: 1.0, step: 1.0
uniform float u_animSpeed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1

// Bayer 2x2 matrix
float bayer2(vec2 coord) {
  vec2 p = floor(mod(coord, 2.0));
  float idx = p.x + p.y * 2.0;
  if (idx < 0.5) return 0.0 / 4.0;
  if (idx < 1.5) return 2.0 / 4.0;
  if (idx < 2.5) return 3.0 / 4.0;
  return 1.0 / 4.0;
}

// Bayer 4x4 matrix
float bayer4(vec2 coord) {
  vec2 p = floor(mod(coord, 4.0));
  float v = 0.0;
  float scale = 8.0;
  for (int i = 0; i < 2; i++) {
    vec2 b = floor(p / 2.0);
    float m = mod(p.x, 2.0) + mod(p.y, 2.0) * 2.0;
    if (m < 0.5) v += 0.0;
    else if (m < 1.5) v += 2.0 * scale;
    else if (m < 2.5) v += 3.0 * scale;
    else v += 1.0 * scale;
    scale /= 4.0;
    p = b;
  }
  return v / 16.0;
}

// Bayer 8x8 matrix (same as original dithering shader)
float bayer8(vec2 coord) {
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

// Get dither threshold based on selected pattern
float getDitherThreshold(vec2 coord, int pattern) {
  if (pattern == 0) return bayer8(coord);
  if (pattern == 1) return bayer4(coord);
  return bayer2(coord);
}

// Convert RGB to grayscale luminance
float getLuminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  // Pixelate coordinates
  vec2 pixelCoord = floor(gl_FragCoord.xy / u_pixelSize);
  vec2 snappedCoord = pixelCoord * u_pixelSize + u_pixelSize * 0.5;
  
  // Calculate UV for image sampling
  vec2 uv = snappedCoord / u_resolution;
  
  // Flip Y for correct image orientation
  uv.y = 1.0 - uv.y;
  
  // Calculate aspect ratios
  float canvasAspect = u_resolution.x / u_resolution.y;
  float imageAspect = u_imageResolution.x / u_imageResolution.y;
  
  // Fit mode: 0 = Cover (fill), 1 = Contain (fit), 2 = Stretch
  vec2 scale = vec2(1.0);
  int fitMode = int(u_fitMode);
  
  if (fitMode == 0) {
    // Cover mode - scale to fill, center crop
    if (canvasAspect > imageAspect) {
      scale.y = imageAspect / canvasAspect;
    } else {
      scale.x = canvasAspect / imageAspect;
    }
  } else if (fitMode == 1) {
    // Contain mode - scale to fit, letterbox
    if (canvasAspect > imageAspect) {
      scale.x = imageAspect / canvasAspect;
    } else {
      scale.y = canvasAspect / imageAspect;
    }
  }
  // fitMode == 2 means stretch, scale stays (1.0, 1.0)
  
  // Apply manual scale
  scale /= u_imageScale;
  
  // Apply offset and center
  vec2 centeredUV = (uv - 0.5) / scale + 0.5;
  centeredUV += vec2(u_offsetX, -u_offsetY) / scale;
  
  // Sample the image
  vec4 texColor = texture2D(u_image, centeredUV);
  
  // Get grayscale value with contrast adjustment
  float gray = getLuminance(texColor.rgb);
  gray = (gray - 0.5) * u_contrast + 0.5;
  gray = clamp(gray, 0.0, 1.0);
  
  // Adjust for threshold
  gray = gray + (u_threshold - 0.5);
  gray = clamp(gray, 0.0, 1.0);
  
  // Optional animation - add subtle time-based offset
  float animOffset = 0.0;
  if (u_animate > 0.5) {
    animOffset = sin(u_time * u_animSpeed + pixelCoord.x * 0.1 + pixelCoord.y * 0.1) * 0.05;
  }
  
  // Get dither threshold
  int ditherPattern = int(u_ditherType);
  float threshold = getDitherThreshold(pixelCoord, ditherPattern);
  
  // Apply dithering
  float dithered = step(threshold + animOffset, gray);
  
  // Mix between the two colors based on dither result
  vec3 finalColor = mix(u_color2, u_color1, dithered);
  
  // Handle areas outside the image bounds (only for contain mode)
  if (fitMode == 1) {
    if (centeredUV.x < 0.0 || centeredUV.x > 1.0 || centeredUV.y < 0.0 || centeredUV.y > 1.0) {
      finalColor = u_color2;
    }
  }
  
  gl_FragColor = vec4(finalColor, 1.0);
}`,
};
