import { ShaderPreset } from "./types";

export const sparkle: ShaderPreset = {
  name: "Sparkle",
  description: "Fractal color palette with kaleidoscopic sparkle effect",
  category: "Effects",
  code: `uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform float u_iterations; // default: 4.0, min: 1.0, max: 8.0, step: 1.0
uniform float u_fractalScale; // default: 1.5, min: 0.5, max: 3.0, step: 0.1
uniform float u_colorSpeed; // default: 0.4, min: 0.0, max: 2.0, step: 0.1
uniform float u_waveFrequency; // default: 8.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_glowIntensity; // default: 0.01, min: 0.001, max: 0.05, step: 0.001
uniform float u_glowPower; // default: 1.2, min: 0.5, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.1, max: 3.0, step: 0.1

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);
    
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec2 uv0 = uv;
    
    vec3 finalColor = vec3(0.0);
    
    for (float i = 0.0; i < 8.0; i++) {
        if (i >= u_iterations) break;
        
        uv = fract(uv * u_fractalScale) - 0.5;
        
        float d = length(uv) * exp(-length(uv0));
        
        vec3 col = palette(length(uv0) + i * 0.4 + u_time * u_colorSpeed);
        
        d = sin(d * u_waveFrequency + u_time) / 8.0;
        d = abs(d);
        
        d = pow(u_glowIntensity / d, u_glowPower);
        
        finalColor += col * d;
    }
    
    gl_FragColor = vec4(finalColor * u_brightness, 1.0);
}`,
};

