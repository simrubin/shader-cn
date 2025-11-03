export const shaderPresets = [
  {
    name: "Animated Spiral",
    description: "Colorful rotating spiral pattern",
    category: "Geometric",
    code: `uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform float u_speed; // default: 1.0, min: 0.0, max: 5.0, step: 0.1
uniform float u_complexity; // default: 10.0, min: 1.0, max: 30.0, step: 0.5
uniform float u_spiralTightness; // default: 8.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_rotation; // default: 0.5, min: 0.0, max: 3.0, step: 0.1
uniform float u_scale; // default: 1.0, min: 0.5, max: 3.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_saturation; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_contrast; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_oscillation; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.5, 0.2, 0.8]
uniform vec3 u_color2; // color, default: [0.2, 0.8, 0.9]
uniform vec3 u_color3; // color, default: [0.9, 0.5, 0.2]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 pos = (uv - 0.5) * u_scale;
    
    float dist = length(pos);
    float angle = atan(pos.y, pos.x) + u_time * u_rotation;
    
    float pattern = sin(dist * u_complexity - u_time * u_speed) * 
                   cos(angle * u_spiralTightness + u_time * 0.5);
    
    pattern += sin(u_time * u_oscillation) * 0.3;
    
    vec3 color = mix(u_color1, u_color2, pattern * 0.5 + 0.5);
    color = mix(color, u_color3, sin(pattern * 3.14159) * 0.5 + 0.5);
    
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, u_saturation);
    color = pow(color, vec3(u_contrast));
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Plasma Wave",
    description: "Organic flowing plasma effect",
    category: "Organic",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_scale; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_waveIntensity; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_colorShift; // default: 1.0, min: 0.0, max: 5.0, step: 0.1
uniform float u_contrast; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [1.0, 0.0, 0.5]
uniform vec3 u_color2; // color, default: [0.0, 0.5, 1.0]
uniform vec3 u_color3; // color, default: [0.5, 1.0, 0.0]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float v1 = sin(uv.x * u_scale + u_time * u_speed) * u_waveIntensity;
    float v2 = sin(uv.y * u_scale + u_time * u_speed * 0.7) * u_waveIntensity;
    float v3 = sin((uv.x + uv.y) * u_scale * 0.5 + u_time * u_speed * 0.5) * u_waveIntensity;
    float v = (v1 + v2 + v3) / 3.0;
    
    v = pow(abs(v), u_contrast) * sign(v);
    
    vec3 color = mix(u_color1, u_color2, v * 0.5 + 0.5);
    color = mix(color, u_color3, sin(v * 3.14159 * u_colorShift) * 0.5 + 0.5);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Kaleidoscope",
    description: "Symmetrical kaleidoscope pattern",
    category: "Geometric",
    code: `uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform float u_segments; // default: 8.0, min: 3.0, max: 16.0, step: 1.0
uniform float u_zoom; // default: 2.0, min: 0.5, max: 5.0, step: 0.1
uniform float u_rotation; // default: 1.0, min: 0.0, max: 5.0, step: 0.1
uniform float u_patternScale; // default: 10.0, min: 1.0, max: 30.0, step: 0.5
uniform float u_warp; // default: 0.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [1.0, 0.3, 0.5]
uniform vec3 u_color2; // color, default: [0.3, 0.8, 1.0]
uniform vec3 u_color3; // color, default: [0.8, 1.0, 0.3]

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    uv *= u_zoom;
    
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    angle += u_time * u_rotation;
    angle = mod(angle, 6.28318 / u_segments);
    
    vec2 pos = vec2(cos(angle), sin(angle)) * radius;
    pos += vec2(sin(radius * 5.0 + u_time), cos(radius * 5.0 - u_time)) * u_warp * 0.1;
    
    float pattern = sin(pos.x * u_patternScale + u_time) * cos(pos.y * u_patternScale - u_time);
    
    vec3 color = mix(u_color1, u_color2, pattern * 0.5 + 0.5);
    color = mix(color, u_color3, sin(pattern * 6.28318) * 0.5 + 0.5);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Noise Field",
    description: "Animated noise-based pattern",
    category: "Organic",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_scale; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_speed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_octaves; // default: 4.0, min: 1.0, max: 8.0, step: 1.0
uniform float u_persistence; // default: 0.5, min: 0.0, max: 1.0, step: 0.1
uniform float u_lacunarity; // default: 2.0, min: 1.0, max: 4.0, step: 0.1
uniform float u_contrast; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.1, 0.1, 0.3]
uniform vec3 u_color2; // color, default: [0.9, 0.5, 0.2]
uniform vec3 u_color3; // color, default: [0.2, 0.9, 0.7]

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for(float i = 0.0; i < 8.0; i++) {
        if(i >= u_octaves) break;
        value += amplitude * noise(st);
        st *= u_lacunarity;
        amplitude *= u_persistence;
    }
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 st = uv * u_scale;
    st.x += u_time * u_speed;
    
    float n = fbm(st);
    n = pow(n, u_contrast);
    
    vec3 color = mix(u_color1, u_color2, n);
    color = mix(color, u_color3, sin(n * 6.28318) * 0.5 + 0.5);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
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
  },
  {
    name: "Grid Distortion",
    description: "Animated distorted grid",
    category: "Geometric",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_gridSize; // default: 20.0, min: 5.0, max: 50.0, step: 1.0
uniform float u_waveAmount; // default: 0.1, min: 0.0, max: 0.5, step: 0.01
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_waveFrequency; // default: 10.0, min: 1.0, max: 30.0, step: 0.5
uniform float u_lineThickness; // default: 0.95, min: 0.8, max: 0.99, step: 0.01
uniform float u_glow; // default: 0.0, min: 0.0, max: 1.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_lineColor; // color, default: [0.0, 1.0, 1.0]
uniform vec3 u_bgColor; // color, default: [0.0, 0.0, 0.1]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    uv.x += sin(uv.y * u_waveFrequency + u_time * u_speed) * u_waveAmount;
    uv.y += cos(uv.x * u_waveFrequency + u_time * u_speed) * u_waveAmount;
    
    vec2 grid = fract(uv * u_gridSize);
    float line = step(u_lineThickness, max(grid.x, grid.y));
    
    vec3 color = mix(u_bgColor, u_lineColor, line);
    
    if(u_glow > 0.0) {
        float dist = min(grid.x, grid.y);
        color += u_lineColor * u_glow * (1.0 - smoothstep(0.0, 0.1, dist));
    }
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
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
  },
  {
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
  },
  {
    name: "Hexagon Grid",
    description: "Animated hexagonal tiling pattern",
    category: "Geometric",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_scale; // default: 10.0, min: 2.0, max: 30.0, step: 0.5
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_waveAmount; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_colorShift; // default: 1.0, min: 0.0, max: 5.0, step: 0.1
uniform float u_lineThickness; // default: 0.1, min: 0.01, max: 0.5, step: 0.01
uniform float u_glow; // default: 0.3, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.0, 1.0, 1.0]
uniform vec3 u_color2; // color, default: [1.0, 0.0, 1.0]

vec2 hexCoords(vec2 uv) {
    const vec2 s = vec2(1.0, 1.732);
    vec2 h = uv * s;
    vec2 f = fract(h);
    h -= f;
    float v = mod(h.x + h.y, 3.0);
    if(v < 1.0) {
        if(f.x + f.y > 1.0) h += 1.0;
    } else if(v < 2.0) {
        if(f.x < f.y) h.y += 1.0;
        else h.x += 1.0;
    } else {
        if(f.x + f.y < 1.0) h -= 1.0;
    }
    return h / s;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = (uv - 0.5) * u_scale;
    
    vec2 hex = hexCoords(uv);
    vec2 local = uv - hex;
    float dist = length(local);
    
    float wave = sin(hex.x + hex.y + u_time * u_speed) * u_waveAmount;
    float pattern = smoothstep(0.5 - u_lineThickness, 0.5, dist + wave);
    
    vec3 color = mix(u_color1, u_color2, sin(hex.x + hex.y + u_time * u_colorShift) * 0.5 + 0.5);
    color = mix(color, vec3(1.0), (1.0 - pattern) * u_glow);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Lava Lamp",
    description: "Organic lava lamp effect",
    category: "Organic",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_blobCount; // default: 5.0, min: 2.0, max: 15.0, step: 1.0
uniform float u_blobSize; // default: 0.3, min: 0.1, max: 0.8, step: 0.05
uniform float u_speed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_smoothness; // default: 0.1, min: 0.01, max: 0.5, step: 0.01
uniform float u_warp; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [1.0, 0.2, 0.0]
uniform vec3 u_color2; // color, default: [1.0, 0.8, 0.0]
uniform vec3 u_bgColor; // color, default: [0.1, 0.0, 0.2]

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    float field = 0.0;
    for(float i = 0.0; i < 15.0; i++) {
        if(i >= u_blobCount) break;
        vec2 pos = vec2(
            sin(u_time * u_speed + i * 2.4) * 0.5,
            cos(u_time * u_speed * 0.7 + i * 1.8) * 0.5
        );
        pos += vec2(sin(i * 3.0), cos(i * 2.5)) * u_warp * 0.2;
        float dist = length(uv - pos);
        field += u_blobSize / dist;
    }
    
    float blob = smoothstep(0.5, 0.5 + u_smoothness, field);
    
    vec3 color = mix(u_bgColor, u_color1, blob);
    color = mix(color, u_color2, smoothstep(0.7, 1.0, field));
    color += u_color2 * u_glow * smoothstep(1.0, 2.0, field);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Voronoi Cells",
    description: "Animated voronoi diagram",
    category: "Geometric",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_cellCount; // default: 8.0, min: 3.0, max: 20.0, step: 1.0
uniform float u_speed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_borderWidth; // default: 0.05, min: 0.0, max: 0.2, step: 0.01
uniform float u_colorVariation; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_movement; // default: 0.3, min: 0.0, max: 1.0, step: 0.05
uniform float u_glow; // default: 0.0, min: 0.0, max: 1.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.2, 0.5, 1.0]
uniform vec3 u_color2; // color, default: [1.0, 0.2, 0.5]
uniform vec3 u_borderColor; // color, default: [1.0, 1.0, 1.0]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float minDist1 = 100.0;
    float minDist2 = 100.0;
    float cellId = 0.0;
    
    for(float i = 0.0; i < 20.0; i++) {
        if(i >= u_cellCount) break;
        vec2 point = vec2(
            sin(u_time * u_speed + i * 2.4) * u_movement + 0.5,
            cos(u_time * u_speed * 0.7 + i * 1.8) * u_movement + 0.5
        );
        float dist = distance(uv, point);
        if(dist < minDist1) {
            minDist2 = minDist1;
            minDist1 = dist;
            cellId = i;
        } else if(dist < minDist2) {
            minDist2 = dist;
        }
    }
    
    float border = smoothstep(u_borderWidth, 0.0, minDist2 - minDist1);
    
    vec3 cellColor = mix(u_color1, u_color2, sin(cellId * u_colorVariation) * 0.5 + 0.5);
    vec3 color = mix(cellColor, u_borderColor, border);
    color += u_borderColor * u_glow * border;
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
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
    vec2 center = u_mouse.xy / u_resolution.xy;
    if(length(center) < 0.01) center = vec2(0.5);
    
    float dist = distance(uv, center);
    float ripple = sin(dist * u_frequency * u_rippleCount - u_time * u_speed) * u_amplitude;
    ripple *= exp(-dist * u_decay);
    ripple = pow(abs(ripple), 1.0 / u_sharpness) * sign(ripple);
    
    vec3 color = mix(u_color1, u_color2, ripple * 0.5 + 0.5);
    color *= (1.0 + ripple);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Fractal Zoom",
    description: "Infinite fractal zoom effect",
    category: "3D",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_zoomSpeed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_rotationSpeed; // default: 0.3, min: 0.0, max: 2.0, step: 0.1
uniform float u_complexity; // default: 5.0, min: 2.0, max: 10.0, step: 1.0
uniform float u_scale; // default: 2.0, min: 1.0, max: 5.0, step: 0.1
uniform float u_detail; // default: 1.0, min: 0.5, max: 3.0, step: 0.1
uniform float u_colorCycle; // default: 1.0, min: 0.0, max: 5.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.5, 0.0, 1.0]
uniform vec3 u_color2; // color, default: [0.0, 1.0, 1.0]
uniform vec3 u_color3; // color, default: [1.0, 0.5, 0.0]

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    float zoom = exp(u_time * u_zoomSpeed);
    float angle = u_time * u_rotationSpeed;
    
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = rot * uv;
    
    float pattern = 0.0;
    for(float i = 0.0; i < 10.0; i++) {
        if(i >= u_complexity) break;
        uv = abs(uv) / dot(uv, uv) - u_scale;
        pattern += length(uv) * u_detail;
    }
    
    pattern = fract(pattern / zoom);
    
    vec3 color = mix(u_color1, u_color2, pattern);
    color = mix(color, u_color3, sin(pattern * 6.28318 * u_colorCycle) * 0.5 + 0.5);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Particle Field",
    description: "Animated particle system",
    category: "Effects",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_particleCount; // default: 50.0, min: 10.0, max: 100.0, step: 5.0
uniform float u_particleSize; // default: 0.02, min: 0.005, max: 0.1, step: 0.005
uniform float u_speed; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_flowStrength; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_trails; // default: 0.0, min: 0.0, max: 1.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_color1; // color, default: [0.0, 1.0, 1.0]
uniform vec3 u_color2; // color, default: [1.0, 0.0, 1.0]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    vec3 color = vec3(0.0);
    
    for(float i = 0.0; i < 100.0; i++) {
        if(i >= u_particleCount) break;
        
        float t = u_time * u_speed + i * 0.5;
        vec2 pos = vec2(
            fract(sin(i * 12.9898) + t * 0.1),
            fract(sin(i * 78.233) + t * 0.15)
        );
        
        pos.x += sin(pos.y * 10.0 + t) * u_flowStrength * 0.1;
        pos.y += cos(pos.x * 10.0 + t) * u_flowStrength * 0.1;
        
        float dist = distance(uv, pos);
        float particle = u_particleSize / dist;
        particle = pow(particle, 1.0 + u_glow);
        
        vec3 particleColor = mix(u_color1, u_color2, fract(i / 10.0));
        color += particleColor * particle;
        
        if(u_trails > 0.0) {
            vec2 prevPos = pos - vec2(sin(t), cos(t)) * 0.01 * u_trails;
            float trailDist = distance(uv, prevPos);
            color += particleColor * (u_particleSize / trailDist) * 0.3 * u_trails;
        }
    }
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Glitch Effect",
    description: "Digital glitch distortion",
    category: "Effects",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_glitchAmount; // default: 0.5, min: 0.0, max: 1.0, step: 0.05
uniform float u_glitchSpeed; // default: 5.0, min: 0.0, max: 20.0, step: 0.5
uniform float u_blockSize; // default: 20.0, min: 5.0, max: 100.0, step: 5.0
uniform float u_rgbShift; // default: 0.02, min: 0.0, max: 0.1, step: 0.005
uniform float u_scanlines; // default: 0.3, min: 0.0, max: 1.0, step: 0.1
uniform float u_noise; // default: 0.1, min: 0.0, max: 0.5, step: 0.05
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_baseColor; // color, default: [0.0, 1.0, 0.5]

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float glitch = step(0.9, random(vec2(floor(u_time * u_glitchSpeed))));
    float blockY = floor(uv.y * u_blockSize) / u_blockSize;
    float shift = (random(vec2(blockY, floor(u_time * u_glitchSpeed))) - 0.5) * u_glitchAmount * glitch;
    
    vec2 uvR = uv + vec2(shift + u_rgbShift, 0.0);
    vec2 uvG = uv + vec2(shift, 0.0);
    vec2 uvB = uv + vec2(shift - u_rgbShift, 0.0);
    
    float r = sin(uvR.x * 10.0 + u_time) * 0.5 + 0.5;
    float g = sin(uvG.y * 10.0 + u_time) * 0.5 + 0.5;
    float b = cos(uvB.x * 8.0 - u_time) * 0.5 + 0.5;
    
    vec3 color = vec3(r, g, b) * u_baseColor;
    
    float scanline = sin(uv.y * u_resolution.y * 2.0) * u_scanlines;
    color *= 1.0 - scanline;
    
    float noise = (random(uv + u_time) - 0.5) * u_noise;
    color += noise;
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    name: "Liquid Metal",
    description: "Metallic liquid surface",
    category: "3D",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_waveFrequency; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_waveAmplitude; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_metallic; // default: 0.8, min: 0.0, max: 1.0, step: 0.05
uniform float u_roughness; // default: 0.2, min: 0.0, max: 1.0, step: 0.05
uniform float u_reflectivity; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_baseColor; // color, default: [0.7, 0.8, 0.9]
uniform vec3 u_highlightColor; // color, default: [1.0, 1.0, 1.0]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float wave1 = sin(uv.x * u_waveFrequency + u_time * u_speed) * u_waveAmplitude;
    float wave2 = cos(uv.y * u_waveFrequency * 0.7 - u_time * u_speed * 0.8) * u_waveAmplitude;
    float wave3 = sin((uv.x + uv.y) * u_waveFrequency * 0.5 + u_time * u_speed * 0.5) * u_waveAmplitude;
    
    float surface = (wave1 + wave2 + wave3) / 3.0;
    
    vec2 normal = vec2(
        cos(uv.x * u_waveFrequency + u_time * u_speed),
        sin(uv.y * u_waveFrequency + u_time * u_speed)
    );
    normal = normalize(normal);
    
    float fresnel = pow(1.0 - abs(dot(normal, vec2(0.0, 1.0))), 3.0);
    float specular = pow(max(0.0, surface), 1.0 / (u_roughness + 0.01));
    
    vec3 color = mix(u_baseColor, u_highlightColor, fresnel * u_reflectivity);
    color += u_highlightColor * specular * u_metallic;
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Neon Grid",
    description: "Retro neon grid perspective",
    category: "3D",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_gridSize; // default: 20.0, min: 5.0, max: 50.0, step: 1.0
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_perspective; // default: 2.0, min: 0.5, max: 5.0, step: 0.1
uniform float u_horizon; // default: 0.3, min: 0.0, max: 0.8, step: 0.05
uniform float u_lineWidth; // default: 0.05, min: 0.01, max: 0.2, step: 0.01
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_gridColor; // color, default: [0.0, 1.0, 1.0]
uniform vec3 u_horizonColor; // color, default: [1.0, 0.0, 1.0]
uniform vec3 u_skyColor; // color, default: [0.1, 0.0, 0.2]

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    vec3 color = u_skyColor;
    
    if(uv.y < u_horizon) {
        float depth = (u_horizon - uv.y) / u_horizon;
        depth = pow(depth, u_perspective);
        
        vec2 gridUV = vec2(uv.x - 0.5, u_time * u_speed) / depth;
        gridUV *= u_gridSize;
        
        vec2 grid = abs(fract(gridUV) - 0.5);
        float line = min(grid.x, grid.y);
        float gridLine = smoothstep(u_lineWidth, 0.0, line);
        
        vec3 gridCol = mix(u_gridColor, u_horizonColor, 1.0 - depth);
        gridCol *= (1.0 + u_glow * gridLine);
        
        color = mix(color, gridCol, gridLine * depth);
    } else {
        float horizonGlow = exp(-(uv.y - u_horizon) * 5.0) * u_glow;
        color += u_horizonColor * horizonGlow;
    }
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Psychedelic Swirl",
    description: "Trippy swirling colors",
    category: "Organic",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_swirlSpeed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_swirlIntensity; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_colorSpeed; // default: 1.0, min: 0.0, max: 5.0, step: 0.1
uniform float u_layers; // default: 3.0, min: 1.0, max: 8.0, step: 1.0
uniform float u_warp; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_saturation; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    float pattern = 0.0;
    for(float i = 0.0; i < 8.0; i++) {
        if(i >= u_layers) break;
        float layer = i + 1.0;
        float swirl = angle + radius * u_swirlIntensity / layer + u_time * u_swirlSpeed;
        pattern += sin(swirl * layer + u_time * u_colorSpeed) / layer;
    }
    
    pattern += sin(radius * 10.0 - u_time) * u_warp * 0.1;
    
    float hue = fract(pattern * 0.5 + u_time * u_colorSpeed * 0.1);
    vec3 color = hsv2rgb(vec3(hue, u_saturation, 1.0));
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "DNA Helix",
    description: "Rotating DNA double helix",
    category: "3D",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_rotationSpeed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_helixTightness; // default: 10.0, min: 3.0, max: 30.0, step: 0.5
uniform float u_strandThickness; // default: 0.05, min: 0.01, max: 0.2, step: 0.01
uniform float u_connectionCount; // default: 20.0, min: 5.0, max: 50.0, step: 1.0
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_depth; // default: 0.3, min: 0.0, max: 1.0, step: 0.05
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_strand1Color; // color, default: [0.0, 1.0, 1.0]
uniform vec3 u_strand2Color; // color, default: [1.0, 0.0, 1.0]
uniform vec3 u_connectionColor; // color, default: [1.0, 1.0, 0.0]

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    vec3 color = vec3(0.0);
    
    for(float i = 0.0; i < 50.0; i++) {
        if(i >= u_connectionCount) break;
        
        float t = i / u_connectionCount;
        float y = t * 2.0 - 1.0;
        
        float angle1 = t * u_helixTightness + u_time * u_rotationSpeed;
        float angle2 = angle1 + 3.14159;
        
        vec2 pos1 = vec2(cos(angle1) * u_depth, y);
        vec2 pos2 = vec2(cos(angle2) * u_depth, y);
        
        float dist1 = distance(uv, pos1);
        float dist2 = distance(uv, pos2);
        
        float strand1 = u_strandThickness / dist1;
        float strand2 = u_strandThickness / dist2;
        
        color += u_strand1Color * pow(strand1, 1.0 + u_glow);
        color += u_strand2Color * pow(strand2, 1.0 + u_glow);
        
        float connDist = length(uv - mix(pos1, pos2, 0.5));
        float connWidth = distance(pos1, pos2);
        if(abs(uv.y - y) < 0.01 && abs(uv.x) < connWidth * 0.5) {
            color += u_connectionColor * 0.3;
        }
    }
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Fire",
    description: "Realistic fire effect",
    category: "Organic",
    code: `uniform float u_time;
uniform vec2 u_resolution;

uniform float u_flameHeight; // default: 1.5, min: 0.5,0, max: 0.5, step: 0.1
uniform float u_flameWidth; // default: 0.5, min: 0.2, max: 1.0, step: 0.05
uniform float u_turbulence; // default: 5.0, min: 1.0, max: 20.0, step: 0.5
uniform float u_speed; // default: 1.0, min: 0.0, max: 3.0, step: 0.1
uniform float u_intensity; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_glow; // default: 0.5, min: 0.0, max: 2.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_coreColor; // color, default: [1.0, 1.0, 0.8]
uniform vec3 u_midColor; // color, default: [1.0, 0.5, 0.0]
uniform vec3 u_edgeColor; // color, default: [1.0, 0.0, 0.0]

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x = (uv.x - 0.5) / u_flameWidth + 0.5;
    
    vec2 noiseUV = vec2(uv.x * u_turbulence, (uv.y - u_time * u_speed) * u_turbulence);
    float n = noise(noiseUV);
    n += noise(noiseUV * 2.0) * 0.5;
    n += noise(noiseUV * 4.0) * 0.25;
    
    float flame = smoothstep(0.0, u_flameHeight, uv.y + n * 0.5);
    flame *= smoothstep(1.0, 0.0, abs(uv.x - 0.5) * 2.0);
    flame *= u_intensity;
    
    vec3 color = mix(u_edgeColor, u_midColor, flame);
    color = mix(color, u_coreColor, pow(flame, 2.0));
    color += u_coreColor * u_glow * pow(flame, 3.0);
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: "Lens Blur",
    description: "Bokeh lens blur effect with focal point",
    category: "Effects",
    code: `uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform float u_focalDistance; // default: 0.5, min: 0.0, max: 1.0, step: 0.05
uniform float u_focalSize; // default: 0.3, min: 0.1, max: 0.8, step: 0.05
uniform float u_blurAmount; // default: 0.5, min: 0.0, max: 1.0, step: 0.05
uniform float u_bokehSamples; // default: 32.0, min: 8.0, max: 64.0, step: 8.0
uniform float u_bokehShape; // default: 6.0, min: 3.0, max: 12.0, step: 1.0
uniform float u_bokehIntensity; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform float u_chromatic; // default: 0.01, min: 0.0, max: 0.05, step: 0.005
uniform float u_vignette; // default: 0.3, min: 0.0, max: 1.0, step: 0.1
uniform float u_brightness; // default: 1.0, min: 0.0, max: 2.0, step: 0.1
uniform vec3 u_bgColor; // color, default: [0.05, 0.05, 0.1]

vec3 bokehShape(vec2 pos, float sides) {
    float angle = atan(pos.y, pos.x);
    float radius = length(pos);
    angle = mod(angle + 6.28318 / sides * 0.5, 6.28318 / sides) - 3.14159 / sides;
    float shapeVal = cos(angle) / cos(3.14159 / sides);
    float bokeh = smoothstep(shapeVal * radius + 0.01, 0.0, radius);
    return vec3(bokeh);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 center = u_mouse.xy / u_resolution.xy;
    if(length(center) < 0.01) center = vec2(0.5, 0.5);
    
    float dist = distance(uv, center);
    float inFocus = smoothstep(u_focalSize + u_blurAmount * 0.5, u_focalSize - u_blurAmount * 0.1, dist);
    float blurStrength = (1.0 - inFocus) * u_blurAmount;
    
    vec3 color = u_bgColor;
    float sampleWeight = 0.0;
    
    // Main bokeh generation
    for(float i = 0.0; i < 64.0; i++) {
        if(i >= u_bokehSamples) break;
        
        float angle = i * 6.28318 / u_bokehSamples;
        float radius = blurStrength * 0.3;
        
        vec2 samplePos = uv + vec2(cos(angle), sin(angle)) * radius;
        float sampleDist = distance(samplePos, center);
        
        // Bokeh shape using polygon
        vec2 bokehOffset = vec2(cos(angle), sin(angle)) * radius * 0.5;
        vec3 bokehVal = bokehShape(bokehOffset, u_bokehShape);
        
        // Luminance calculation
        float lum = sin(sampleDist * 10.0 + u_time * 0.5) * 0.5 + 0.5;
        lum *= (1.0 - sampleDist) * bokehVal.x;
        
        color += vec3(lum * u_bokehIntensity);
        sampleWeight += bokehVal.x;
    }
    
    color /= max(sampleWeight, 0.1);
    color += vec3(inFocus * 0.3);
    
    // Chromatic aberration on blur
    if(u_chromatic > 0.0) {
        vec2 chrOffset = normalize(uv - center) * u_chromatic * blurStrength;
        vec3 chrColor = vec3(
            sin(distance(uv + chrOffset, center) * 5.0),
            sin(distance(uv, center) * 5.0),
            sin(distance(uv - chrOffset, center) * 5.0)
        );
        color = mix(color, chrColor * 0.3, u_chromatic);
    }
    
    // Vignette
    float vig = length(uv - 0.5) * u_vignette;
    color *= 1.0 - vig * vig;
    
    color *= u_brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
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
  },
]
