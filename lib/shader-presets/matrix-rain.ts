import { ShaderPreset } from "./types";

export const matrixRain: ShaderPreset = {
  name: "Matrix Rain",
  description: "Digital matrix code rain",
  category: "Effects",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_columns; // default: 40.0, min: 10.0, max: 100.0, step: 5.0
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_density; // default: 0.5, min: 0.0, max: 1.0, step: 0.05
uniform float u_fadeLength; // default: 0.3, min: 0.1, max: 0.8, step: 0.05
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_glow; // default: 0.3, min: 0.0, max: 1.0, step: 0.1
uniform vec3 u_color; // color, default: [0.0, 1.0, 0.3]
uniform vec3 u_highlightColor; // color, default: [0.5, 1.0, 0.5]

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float col = floor(uv.x * u_columns);
    float speed = random(vec2(col, 0.0)) * 0.5 + 0.5;
    float offset = random(vec2(col, 1.0)) * 10.0;
    
    float y = fract(uv.y - u_time * u_speed * speed + offset);
    
    float drop = step(random(vec2(col, floor(u_time * 2.0))), u_density);
    float char = step(0.5, random(vec2(col, floor(y * 20.0) + floor(u_time * 10.0))));
    
    float fade = smoothstep(0.0, u_fadeLength, y);
    float highlight = smoothstep(0.9, 1.0, y);
    
    vec3 color = mix(u_color, u_highlightColor, highlight);
    float intensity = char * drop * fade * (1.0 + u_glow * highlight);
    color *= intensity * u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

