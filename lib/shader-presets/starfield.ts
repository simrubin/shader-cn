import { ShaderPreset } from "./types";

export const starfield: ShaderPreset = {
  name: "Starfield",
  description: "Moving starfield effect",
  category: "3D",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_starCount; // default: 100.0, min: 20.0, max: 200.0, step: 10.0
uniform float u_speed; // default: 1.0, min: 0.0, max: 5.0, step: 0.1
uniform float u_starSize; // default: 0.003, min: 0.001, max: 0.01, step: 0.001
uniform float u_twinkle; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_depth; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_starColor; // color, default: [1.0, 1.0, 1.0]
uniform vec3 u_spaceColor; // color, default: [0.0, 0.0, 0.1]

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    vec3 color = u_spaceColor;
    
    for(float i = 0.0; i < 200.0; i++) {
        if(i >= u_starCount) break;
        
        vec2 starPos = vec2(
            random(vec2(i, 0.0)) * 2.0 - 1.0,
            random(vec2(i, 1.0)) * 2.0 - 1.0
        );
        
        float z = random(vec2(i, 2.0)) * u_depth;
        float zSpeed = (1.0 + z) * u_speed;
        
        starPos.y = fract(starPos.y + u_time * zSpeed * 0.1) * 2.0 - 1.0;
        
        vec2 screenPos = starPos / (1.0 + z);
        float dist = distance(uv, screenPos);
        
        float size = u_starSize * (1.0 + z * 0.5);
        float twinkle = sin(u_time * u_twinkle + i) * 0.3 + 0.7;
        
        float star = size / dist;
        star = pow(star, 1.0 + u_glow) * twinkle;
        
        color += u_starColor * star;
    }
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

