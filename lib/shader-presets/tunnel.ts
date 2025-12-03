import { ShaderPreset } from "./types";

export const tunnel: ShaderPreset = {
  name: "Tunnel",
  description: "3D tunnel effect with raymarching",
  category: "3D",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_radius; // default: 0.5, min: 0.1, max: 1.0, step: 0.05
uniform float u_twist; // default: 2.0, min: 0.0, max: 10.0, step: 0.5
uniform float u_depth; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_rings; // default: 8.0, min: 1.0, max: 20.0, step: 1.0
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.5, 0.0, 1.0]
uniform vec3 u_color2; // color, default: [0.0, 1.0, 0.5]

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    float depth = u_time * u_speed + 1.0 / (radius + 0.1);
    angle += depth * u_twist;
    
    float pattern = sin(depth * u_depth) * cos(angle * u_rings);
    float tunnel = smoothstep(u_radius, u_radius + 0.1, radius);
    
    vec3 color = mix(u_color1, u_color2, pattern * 0.5 + 0.5);
    color *= (1.0 - tunnel);
    color += vec3(u_glow) * (1.0 - smoothstep(0.0, 0.5, abs(pattern)));
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

