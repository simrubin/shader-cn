import { ShaderPreset } from "./types";

export const auroraBorealis: ShaderPreset = {
  name: "Aurora Borealis",
  description: "Northern lights effect",
  category: "Organic",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_waveCount; // default: 3.0, min: 1.0, max: 8.0, step: 1.0
uniform float u_waveSpeed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_waveHeight; // default: 0.3, min: 0.1, max: 0.8, step: 0.05
uniform float u_shimmer; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_flow; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.0, 1.0, 0.5]
uniform vec3 u_color2; // color, default: [0.0, 0.5, 1.0]
uniform vec3 u_color3; // color, default: [0.5, 0.0, 1.0]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    vec3 color = vec3(0.0);
    
    for(float i = 0.0; i < 8.0; i++) {
        if(i >= u_waveCount) break;
        
        float offset = i * 0.3;
        float wave = sin(uv.x * 3.0 + u_time * u_waveSpeed + offset) * u_waveHeight;
        wave += sin(uv.x * 5.0 - u_time * u_waveSpeed * 0.7 + offset) * u_waveHeight * 0.5;
        
        float y = 0.5 + wave + offset * 0.1;
        float dist = abs(uv.y - y);
        
        float shimmerVal = sin(uv.x * 20.0 + u_time * u_shimmer + i) * 0.5 + 0.5;
        float flowVal = sin(uv.x * u_flow + u_time + i) * 0.5 + 0.5;
        
        float aurora = exp(-dist * (10.0 + shimmerVal * 5.0)) * (1.0 + u_glow);
        
        vec3 waveColor = mix(u_color1, u_color2, flowVal);
        waveColor = mix(waveColor, u_color3, sin(i + u_time) * 0.5 + 0.5);
        
        color += waveColor * aurora;
    }
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

