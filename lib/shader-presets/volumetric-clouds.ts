import { ShaderPreset } from "./types";

export const volumetricClouds: ShaderPreset = {
  name: "Volumetric Clouds",
  description: "3D volumetric cloud rendering",
  category: "3D",
  code: `uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform float u_density; // default: 0.4, min: 0.1, max: 1.0, step: 0.05
uniform float u_speed; // default: 0.3, min: 0.0, max: 2.0, step: 0.1
uniform float u_scale; // default: 3.0, min: 1.0, max: 10.0, step: 0.5
uniform float u_detail; // default: 4.0, min: 2.0, max: 6.0, step: 1.0
uniform float u_absorption; // default: 0.8, min: 0.0, max: 2.0, step: 0.1
uniform float u_scattering; // default: 0.6, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_cloudColor; // color, default: [0.9, 0.9, 1.0]
uniform vec3 u_skyColor; // color, default: [0.3, 0.5, 0.8]

// Optimized hash - single operation
float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Optimized 3D value noise
float noise3d(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

// Optimized FBM - max 4 octaves with unrolled loop
float fbm3d(vec3 p) {
    float v = 0.5 * noise3d(p); p *= 2.0;
    v += 0.25 * noise3d(p); p *= 2.0;
    if(u_detail > 2.0) v += 0.125 * noise3d(p); p *= 2.0;
    if(u_detail > 3.0) v += 0.0625 * noise3d(p);
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    vec2 mouse = u_mouse - 0.5;
    vec3 ro = vec3(0.0, 0.0, 0.0);
    vec3 rd = normalize(vec3(uv + mouse * 0.5, 1.0));
    
    // Pre-calculate wind
    vec3 wind = vec3(u_time * u_speed * 0.1, 0.0, u_time * u_speed * 0.05);
    
    // Raymarch with 32 steps (half of original 64)
    vec3 p = ro;
    float transmittance = 1.0;
    vec3 scatteredLight = vec3(0.0);
    
    for(int i = 0; i < 32; i++) {
        float density = fbm3d((p + wind) * u_scale);
        density = smoothstep(u_density - 0.2, u_density + 0.2, density);
        
        if(density > 0.01) {
            scatteredLight += u_cloudColor * density * u_scattering * transmittance;
            transmittance *= exp(-density * u_absorption);
            if(transmittance < 0.01) break;
        }
        
        p += rd * 0.12;
        if(p.z > 4.0) break;
    }
    
    vec3 color = u_skyColor * transmittance + scatteredLight;
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};
