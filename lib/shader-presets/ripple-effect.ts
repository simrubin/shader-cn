import { ShaderPreset } from "./types";

export const rippleEffect: ShaderPreset = {
  name: "Ripple Effect",
  description: "Concentric ripple waves",
  category: "Organic",
  code: `uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform float u_rippleCount; // default: 10.0, min: 3.0, max: 30.0, step: 1.0
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_frequency; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_amplitude; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_decay; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_sharpness; // default: 10.0, min: 1.0, max: 30.0, step: 1.0
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.0, 0.5, 1.0]
uniform vec3 u_color2; // color, default: [0.0, 1.0, 0.5]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    vec2 center = u_mouse.xy / u_resolution.xy;
    center.x *= aspect;
    if(length(center) < 0.01) center = vec2(0.5 * aspect, 0.5);
    
    float dist = distance(uv, center);
    float ripple = sin(dist * u_frequency * u_rippleCount - u_time * u_speed) * u_amplitude;
    ripple *= exp(-dist * u_decay);
    ripple = pow(abs(ripple), 1.0 / u_sharpness) * sign(ripple);
    
    vec3 color = mix(u_color1, u_color2, ripple * 0.5 + 0.5);
    color *= (1.0 + ripple);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

