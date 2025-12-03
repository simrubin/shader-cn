import { ShaderPreset } from "./types";

export const mandala: ShaderPreset = {
  name: "Mandala",
  description: "Symmetrical mandala pattern",
  category: "Geometric",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_symmetry; // default: 12.0, min: 4.0, max: 24.0, step: 1.0
uniform float u_layers; // default: 5.0, min: 1.0, max: 10.0, step: 1.0
uniform float u_rotation; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_scale; // default: 10.0, min: 1.0, max: 30.0, step: 0.5
uniform float u_complexity; // default: 1.0, min: 0.5, max: 3.0, step: 0.1
uniform float u_fadeRadius; // default: 2.0, min: 0.5, max: 5.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [1.0, 0.8, 0.2]
uniform vec3 u_color2; // color, default: [0.8, 0.2, 1.0]
uniform vec3 u_color3; // color, default: [0.2, 1.0, 0.8]

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    float angle = atan(uv.y, uv.x) + u_time * u_rotation;
    float radius = length(uv);
    
    angle = mod(angle, 6.28318 / u_symmetry) * u_symmetry;
    
    float pattern = 0.0;
    for(float i = 1.0; i <= 10.0; i++) {
        if(i > u_layers) break;
        pattern += sin(radius * i * u_scale * u_complexity + angle + u_time) / i;
    }
    
    vec3 color = mix(u_color1, u_color2, pattern * 0.5 + 0.5);
    color = mix(color, u_color3, sin(pattern * 3.14159) * 0.5 + 0.5);
    color *= smoothstep(u_fadeRadius, 0.0, radius);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

