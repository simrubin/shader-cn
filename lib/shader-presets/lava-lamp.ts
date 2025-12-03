import { ShaderPreset } from "./types";

export const lavaLamp: ShaderPreset = {
  name: "Lava Lamp",
  description: "Two flowing blobs that connect and separate with film grain",
  category: "Organic",
  code: `uniform float u_time;
uniform vec2 u_resolution;

// Blob configuration
uniform float u_blobSize; // default: 0.7, min: 0.3, max: 1.5, step: 0.05
uniform float u_connectionStrength; // default: 0.5, min: 0.0, max: 1.0, step: 0.05
uniform float u_softness; // default: 0.15, min: 0.01, max: 0.5, step: 0.01

// Motion configuration
uniform float u_speed; // default: 0.15, min: 0.0, max: 0.5, step: 0.01
uniform float u_flowAmount; // default: 0.4, min: 0.0, max: 1.0, step: 0.05
uniform float u_wobble; // default: 0.3, min: 0.0, max: 1.0, step: 0.05

// Colors
uniform vec3 u_color1; // color, default: [1.0, 0.55, 0.1]
uniform vec3 u_color2; // color, default: [0.95, 0.25, 0.55]
uniform vec3 u_color3; // color, default: [1.0, 0.8, 0.15]
uniform vec3 u_bgColor; // color, default: [0.0, 0.0, 0.0]

// Grain overlay (applied on top of everything)
uniform float u_grain; // default: 0.3, min: 0.0, max: 1.0, step: 0.05

// Visual
uniform float u_brightness; // default: 1.0, min: 0.5, max: 2.0, step: 0.1

// === GRAIN FUNCTIONS (from glsl-film-grain approach) ===
// 3D noise for natural film grain
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod289(vec4(Pi0, 1.0)).xyz;
    Pi1 = mod289(vec4(Pi1, 1.0)).xyz;
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

// Film grain function
float grain(vec2 texCoord, vec2 resolution, float frame, float multiplier) {
    vec2 mult = texCoord * resolution;
    float offset = cnoise(vec3(mult / multiplier, frame));
    float n1 = cnoise(vec3(mult, offset));
    return n1 / 2.0 + 0.5;
}

// Soft light blend mode
vec3 blendSoftLight(vec3 base, vec3 blend) {
    return mix(
        sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend),
        2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
        step(base, vec3(0.5))
    );
}

// Luminance
float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

// Gradient noise for smooth blob movement
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gradientNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
    );
}

float flowNoise(vec2 p, float time) {
    float n = 0.0;
    n += 0.5 * gradientNoise(p * 1.0 + time * 0.2);
    n += 0.25 * gradientNoise(p * 2.0 - time * 0.15);
    n += 0.125 * gradientNoise(p * 4.0 + time * 0.1);
    return n;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uvCentered = (uv - 0.5) * vec2(aspect, 1.0);
    
    float time = u_time * u_speed;
    
    // Define two blob centers - top right and bottom left (far corners)
    vec2 blob1Base = vec2(0.75, -0.55);  // Far top right
    vec2 blob2Base = vec2(-0.75, 0.55);  // Far bottom left
    
    // Animate blobs toward and away from each other
    float connectionCycle = sin(time * 0.8) * 0.5 + 0.5;
    connectionCycle = pow(connectionCycle, 0.7);
    
    // Move toward center when connecting, back to corners when separating
    vec2 centerTarget = vec2(0.0, 0.0);
    float moveRange = 0.5 + u_flowAmount * 0.3; // How far they travel toward center
    
    vec2 blob1Center = mix(blob1Base, centerTarget, connectionCycle * moveRange);
    vec2 blob2Center = mix(blob2Base, centerTarget, connectionCycle * moveRange);
    
    // Add wobble
    blob1Center.x += sin(time * 1.2) * u_wobble * 0.1;
    blob1Center.y += cos(time * 0.9) * u_wobble * 0.1;
    
    blob2Center.x += cos(time * 1.1) * u_wobble * 0.1;
    blob2Center.y += sin(time * 1.3) * u_wobble * 0.1;
    
    // Calculate distance fields
    float dist1 = length(uvCentered - blob1Center);
    float dist2 = length(uvCentered - blob2Center);
    
    // Add organic distortion to blob edges
    float distort1 = flowNoise(uvCentered * 2.0 + blob1Center, time * 2.0) * 0.15 * u_wobble;
    float distort2 = flowNoise(uvCentered * 2.0 + blob2Center, time * 2.0 + 3.14) * 0.15 * u_wobble;
    
    dist1 += distort1;
    dist2 += distort2;
    
    // Create metaball-like field
    float blobSize = u_blobSize;
    float field1 = blobSize / (dist1 + 0.01);
    float field2 = blobSize / (dist2 + 0.01);
    float field = field1 + field2;
    
    // Threshold for blob surface
    float threshold = 1.8 - u_connectionStrength * 0.8;
    float surface = field - threshold;
    
    // === MULTI-LAYER EDGE GRADIENT ===
    // Create multiple gradient layers for subtle edge falloff
    float softEdge = u_softness * 2.5; // Extend the gradient range
    
    // Core blob (fully solid center)
    float coreBlob = smoothstep(-u_softness * 0.3, u_softness * 0.3, surface);
    
    // Inner gradient layer
    float innerGradient = smoothstep(-softEdge * 0.5, softEdge * 0.3, surface);
    
    // Middle gradient layer  
    float midGradient = smoothstep(-softEdge * 0.8, softEdge * 0.5, surface);
    
    // Outer gradient layer (subtle fade)
    float outerGradient = smoothstep(-softEdge, softEdge * 0.7, surface);
    
    // Combine layers with weighted blend for smooth falloff
    // Core is strongest, each layer adds subtle extension
    float blob = coreBlob * 0.5 + innerGradient * 0.25 + midGradient * 0.15 + outerGradient * 0.1;
    
    // Apply subtle power curve for even smoother falloff
    blob = pow(blob, 0.85);
    
    // Color blending based on which blob dominates
    float colorBlend = field1 / (field1 + field2 + 0.001);
    
    // Create gradient within blobs
    vec3 blobColor1 = mix(u_color1, u_color3, smoothstep(0.0, blobSize * 1.5, dist1));
    vec3 blobColor2 = mix(u_color2, u_color1, smoothstep(0.0, blobSize * 1.5, dist2));
    
    // Mix blob colors
    vec3 blobColor = mix(blobColor2, blobColor1, colorBlend);
    
    // Add yellow in merge zones
    float mergeZone = min(field1, field2) / max(field1, field2);
    mergeZone = smoothstep(0.3, 0.9, mergeZone);
    blobColor = mix(blobColor, u_color3, mergeZone * 0.4);
    
    // Base color before grain
    vec3 baseColor = mix(u_bgColor, blobColor, blob);
    baseColor *= u_brightness;
    
    // === APPLY FILM GRAIN ON TOP OF EVERYTHING ===
    float grainSize = 2.5;
    float frame = floor(u_time * 10.0); // Animate grain
    float g = grain(uv, u_resolution / grainSize, frame, grainSize);
    vec3 grainColor = vec3(g);
    
    // Blend grain using soft light
    vec3 blended = blendSoftLight(baseColor, grainColor);
    
    // Reduce grain based on luminance (less visible on dark areas)
    float luminance = luma(baseColor);
    float response = smoothstep(0.05, 0.5, luminance);
    blended = mix(blended, baseColor, pow(response, 2.0) * (1.0 - u_grain));
    
    // Mix based on grain intensity
    vec3 finalColor = mix(baseColor, blended, u_grain);
    
    gl_FragColor = vec4(finalColor, 1.0);
}`,
};
