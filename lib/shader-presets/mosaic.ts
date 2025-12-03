import { ShaderPreset } from "./types";

export const mosaic: ShaderPreset = {
  name: "Mosaic",
  description: "Animated mosaic tiles",
  category: "Geometric",
  code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_tileSize; // default: 20.0, min: 5.0, max: 100.0, step: 1.0
uniform float u_colorVariation; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_animationSpeed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_borderWidth; // default: 0.1, min: 0.0, max: 0.5, step: 0.05
uniform float u_shimmer; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [1.0, 0.2, 0.5]
uniform vec3 u_color2; // color, default: [0.2, 0.5, 1.0]
uniform vec3 u_color3; // color, default: [0.5, 1.0, 0.2]
uniform vec3 u_borderColor; // color, default: [0.1, 0.1, 0.1]

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 tileUV = uv * u_tileSize;
    vec2 tileID = floor(tileUV);
    vec2 tileFract = fract(tileUV);
    
    float tileRandom = random(tileID);
    float colorIndex = floor(tileRandom * 3.0);
    
    vec3 tileColor;
    if(colorIndex < 1.0) tileColor = u_color1;
    else if(colorIndex < 2.0) tileColor = u_color2;
    else tileColor = u_color3;
    
    float variation = sin(tileRandom * 10.0 + u_time * u_animationSpeed) * u_colorVariation * 0.2;
    tileColor *= 1.0 + variation;
    
    float shimmerVal = sin(tileRandom * 20.0 + u_time * u_animationSpeed * 2.0) * u_shimmer * 0.3 + 1.0;
    tileColor *= shimmerVal;
    
    float border = step(u_borderWidth, tileFract.x) * step(u_borderWidth, tileFract.y);
    vec3 color = mix(u_borderColor, tileColor, border);
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
};

