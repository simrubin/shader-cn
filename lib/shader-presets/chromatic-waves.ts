import { ShaderPreset } from "./types";

export const chromaticWaves: ShaderPreset = {
  name: "Chromatic Waves",
  description: "RGB color separation effect",
  category: "Effects",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_frequency; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_amplitude; // default: 0.1, min: 0.0, max: 0.5, step: 0.01
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_separation; // default: 0.02, min: 0.0, max: 0.1, step: 0.005
uniform float u_waveCount; // default: 10.0, min: 1.0, max: 30.0, step: 0.5
uniform float u_contrast; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_saturation; // default: 1.0, min: 0.0, max: 2.0, step: 0.1

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float wave = sin(uv.x * u_frequency + u_time * u_speed) * u_amplitude;
    
    float r = sin((uv.y + wave) * u_waveCount);
    float g = sin((uv.y + wave + u_separation) * u_waveCount);
    float b = sin((uv.y + wave + u_separation * 2.0) * u_waveCount);
    
    vec3 color = vec3(r, g, b) * 0.5 + 0.5;
    color = pow(color, vec3(u_contrast));
    
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, u_saturation);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

