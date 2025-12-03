"use client";

import { useEffect, useRef, useCallback } from "react";

export type DitheringPattern = "wave" | "spiral" | "simplex" | "orb";

interface DitheringCanvasProps {
  pattern: DitheringPattern;
  pixelSize?: number;
  speed?: number;
  color1?: [number, number, number];
  color2?: [number, number, number];
  mouseRadius?: number;
  mouseStrength?: number;
  // Wave options
  waveHeight?: number;
  waveFrequency?: number;
  // Spiral options
  spiralArms?: number;
  spiralTightness?: number;
  spiralSize?: number;
  spiralCenter?: number;
  // Orb options
  orbSize?: number;
  orbSoftness?: number;
  className?: string;
}

const ditheringShader = `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_pattern;
uniform float u_pixelSize;
uniform float u_speed;
uniform float u_mouseRadius;
uniform float u_mouseStrength;
uniform vec3 u_color1;
uniform vec3 u_color2;

// Pattern-specific controls
uniform float u_waveHeight;
uniform float u_waveFrequency;
uniform float u_spiralArms;
uniform float u_spiralTightness;
uniform float u_spiralSize;
uniform float u_spiralCenter;
uniform float u_orbSize;
uniform float u_orbSoftness;

// Compute Bayer 8x8 dithering threshold (WebGL 1 compatible)
float getBayer(vec2 coord) {
  vec2 p = floor(mod(coord, 8.0));
  float v = 0.0;
  float scale = 32.0;
  for (int i = 0; i < 3; i++) {
    vec2 b = floor(p / 2.0);
    float m = mod(p.x, 2.0) + mod(p.y, 2.0) * 2.0;
    if (m < 0.5) v += 0.0;
    else if (m < 1.5) v += 2.0 * scale;
    else if (m < 2.5) v += 3.0 * scale;
    else v += 1.0 * scale;
    scale /= 4.0;
    p = b;
  }
  return v / 64.0;
}

// Apply dithering to blend between two colors
vec3 ditherBlend(float value, vec2 pixelCoord, vec3 col1, vec3 col2) {
  float threshold = getBayer(pixelCoord);
  float blend = step(threshold, value);
  return mix(col2, col1, blend);
}

// Pattern 0: Wave - horizontal gradient with animated wave (top to bottom)
float patternWave(vec2 uv, float time) {
  float wave = sin(uv.x * u_waveFrequency + time) * u_waveHeight;
  return smoothstep(0.3, 0.7, (1.0 - uv.y) + wave);
}

// Pattern 1: Spiral - spiral arms from center
float patternSpiral(vec2 uv, float time, vec2 res) {
  vec2 centered = uv - 0.5;
  centered.x *= res.x / res.y;
  
  float dist = length(centered);
  float angle = atan(centered.y, centered.x);
  
  // Create spiral arms that wind outward
  float spiral = angle + dist * u_spiralTightness - time * 1.5;
  float arms = sin(spiral * u_spiralArms) * 0.5 + 0.5;
  
  // Add concentric ring modulation
  float rings = sin(dist * 15.0 - time * 2.0) * 0.3 + 0.7;
  
  // Combine arms with rings
  float pattern = arms * rings;
  
  // Fade out from center and edges
  float centerFade = smoothstep(0.0, u_spiralCenter, dist);
  float edgeFade = smoothstep(u_spiralSize + 0.1, u_spiralSize - 0.1, dist);
  
  return pattern * centerFade * edgeFade;
}

// Pattern 2: Simplex - radial gradient with corner glow
float patternSimplex(vec2 uv, float time, vec2 res) {
  vec2 centered = uv - 0.5;
  centered.x *= res.x / res.y;
  float dist = length(centered);
  
  // Corner glow
  float corners = 0.0;
  corners += smoothstep(0.8, 0.0, length(uv - vec2(0.0, 0.0)));
  corners += smoothstep(0.8, 0.0, length(uv - vec2(1.0, 0.0)));
  corners += smoothstep(0.8, 0.0, length(uv - vec2(0.0, 1.0)));
  corners += smoothstep(0.8, 0.0, length(uv - vec2(1.0, 1.0)));
  
  float center = 1.0 - smoothstep(0.0, 0.5, dist);
  return max(corners * 0.5, 0.0) * (1.0 - center) + sin(time * 0.5) * 0.05;
}

// Pattern 3: Orb - pulsing center orb
float patternOrb(vec2 uv, float time, vec2 res) {
  vec2 centered = uv - 0.5;
  centered.x *= res.x / res.y;
  float dist = length(centered);
  float pulse = sin(time) * 0.03 + u_orbSize;
  return 1.0 - smoothstep(pulse - u_orbSoftness, pulse + u_orbSoftness, dist);
}

void main() {
  // Pixelate coordinates
  vec2 pixelCoord = floor(gl_FragCoord.xy / u_pixelSize);
  vec2 uv = (pixelCoord * u_pixelSize) / u_resolution;
  
  // Mouse interaction - repel pixels away from mouse
  vec2 mousePos = u_mouse;
  vec2 toMouse = uv - mousePos;
  toMouse.x *= u_resolution.x / u_resolution.y;
  float mouseDist = length(toMouse);
  
  // Repulsion effect - push UVs away from mouse
  if (mouseDist < u_mouseRadius && u_mouseRadius > 0.0) {
    vec2 repelDir = normalize(toMouse);
    float repelStrength = (1.0 - mouseDist / u_mouseRadius) * u_mouseStrength;
    uv += repelDir * repelStrength * 0.1;
  }
  
  float time = u_time * u_speed;
  float value = 0.0;
  
  // Select pattern based on uniform
  int pat = int(u_pattern);
  if (pat == 0) {
    value = patternWave(uv, time);
  } else if (pat == 1) {
    value = patternSpiral(uv, time, u_resolution);
  } else if (pat == 2) {
    value = patternSimplex(uv, time, u_resolution);
  } else {
    value = patternOrb(uv, time, u_resolution);
  }
  
  // Apply dithering
  vec3 color = ditherBlend(value, pixelCoord, u_color1, u_color2);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

const patternToIndex = (pattern: DitheringPattern): number => {
  switch (pattern) {
    case "wave":
      return 0;
    case "spiral":
      return 1;
    case "simplex":
      return 2;
    case "orb":
      return 3;
    default:
      return 0;
  }
};

export function DitheringCanvas({
  pattern,
  pixelSize = 4,
  speed = 0.5,
  color1 = [0.96, 0.2, 0.55],
  color2 = [0.1, 0.08, 0.12],
  mouseRadius = 0.15,
  mouseStrength = 0.3,
  waveHeight = 0.3,
  waveFrequency = 3.0,
  spiralArms = 4.0,
  spiralTightness = 6.0,
  spiralSize = 0.6,
  spiralCenter = 0.15,
  orbSize = 0.25,
  orbSoftness = 0.15,
  className = "",
}: DitheringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef(Date.now());
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const uniformsRef = useRef({
    pattern: patternToIndex(pattern),
    pixelSize,
    speed,
    color1,
    color2,
    mouseRadius,
    mouseStrength,
    waveHeight,
    waveFrequency,
    spiralArms,
    spiralTightness,
    spiralSize,
    spiralCenter,
    orbSize,
    orbSoftness,
  });

  // Update uniforms ref when props change
  useEffect(() => {
    uniformsRef.current = {
      pattern: patternToIndex(pattern),
      pixelSize,
      speed,
      color1,
      color2,
      mouseRadius,
      mouseStrength,
      waveHeight,
      waveFrequency,
      spiralArms,
      spiralTightness,
      spiralSize,
      spiralCenter,
      orbSize,
      orbSoftness,
    };
  }, [
    pattern,
    pixelSize,
    speed,
    color1,
    color2,
    mouseRadius,
    mouseStrength,
    waveHeight,
    waveFrequency,
    spiralArms,
    spiralTightness,
    spiralSize,
    spiralCenter,
    orbSize,
    orbSoftness,
  ]);

  const createShader = useCallback(
    (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    },
    []
  );

  const createProgram = useCallback(
    (
      gl: WebGLRenderingContext,
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ) => {
      const program = gl.createProgram();
      if (!program) return null;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return null;
      }

      return program;
    },
    []
  );

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const glContext =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!glContext) {
      console.error("WebGL not supported");
      return;
    }

    const gl = glContext as WebGLRenderingContext;
    glRef.current = gl;

    const handleResize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * pixelRatio;
      canvas.height = canvas.clientHeight * pixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Compile shader
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      ${ditheringShader}
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    if (programRef.current) {
      gl.deleteProgram(programRef.current);
    }
    programRef.current = program;

    // Set up geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    startTimeRef.current = Date.now();
  }, [createShader, createProgram]);

  // Render loop
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    const render = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTimeRef.current) / 1000;

      gl.useProgram(program);

      // Set uniforms
      const timeLocation = gl.getUniformLocation(program, "u_time");
      if (timeLocation) gl.uniform1f(timeLocation, elapsed);

      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      if (resolutionLocation) {
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      }

      const mouseLocation = gl.getUniformLocation(program, "u_mouse");
      if (mouseLocation) {
        gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);
      }

      const patternLocation = gl.getUniformLocation(program, "u_pattern");
      if (patternLocation) {
        gl.uniform1f(patternLocation, uniformsRef.current.pattern);
      }

      const pixelSizeLocation = gl.getUniformLocation(program, "u_pixelSize");
      if (pixelSizeLocation) {
        gl.uniform1f(pixelSizeLocation, uniformsRef.current.pixelSize);
      }

      const speedLocation = gl.getUniformLocation(program, "u_speed");
      if (speedLocation) {
        gl.uniform1f(speedLocation, uniformsRef.current.speed);
      }

      const mouseRadiusLocation = gl.getUniformLocation(
        program,
        "u_mouseRadius"
      );
      if (mouseRadiusLocation) {
        gl.uniform1f(mouseRadiusLocation, uniformsRef.current.mouseRadius);
      }

      const mouseStrengthLocation = gl.getUniformLocation(
        program,
        "u_mouseStrength"
      );
      if (mouseStrengthLocation) {
        gl.uniform1f(mouseStrengthLocation, uniformsRef.current.mouseStrength);
      }

      const color1Location = gl.getUniformLocation(program, "u_color1");
      if (color1Location) {
        gl.uniform3f(color1Location, ...uniformsRef.current.color1);
      }

      const color2Location = gl.getUniformLocation(program, "u_color2");
      if (color2Location) {
        gl.uniform3f(color2Location, ...uniformsRef.current.color2);
      }

      // Pattern-specific uniforms
      const waveHeightLocation = gl.getUniformLocation(program, "u_waveHeight");
      if (waveHeightLocation) {
        gl.uniform1f(waveHeightLocation, uniformsRef.current.waveHeight);
      }

      const waveFrequencyLocation = gl.getUniformLocation(
        program,
        "u_waveFrequency"
      );
      if (waveFrequencyLocation) {
        gl.uniform1f(waveFrequencyLocation, uniformsRef.current.waveFrequency);
      }

      const spiralArmsLocation = gl.getUniformLocation(program, "u_spiralArms");
      if (spiralArmsLocation) {
        gl.uniform1f(spiralArmsLocation, uniformsRef.current.spiralArms);
      }

      const spiralTightnessLocation = gl.getUniformLocation(
        program,
        "u_spiralTightness"
      );
      if (spiralTightnessLocation) {
        gl.uniform1f(
          spiralTightnessLocation,
          uniformsRef.current.spiralTightness
        );
      }

      const spiralSizeLocation = gl.getUniformLocation(program, "u_spiralSize");
      if (spiralSizeLocation) {
        gl.uniform1f(spiralSizeLocation, uniformsRef.current.spiralSize);
      }

      const spiralCenterLocation = gl.getUniformLocation(
        program,
        "u_spiralCenter"
      );
      if (spiralCenterLocation) {
        gl.uniform1f(spiralCenterLocation, uniformsRef.current.spiralCenter);
      }

      const orbSizeLocation = gl.getUniformLocation(program, "u_orbSize");
      if (orbSizeLocation) {
        gl.uniform1f(orbSizeLocation, uniformsRef.current.orbSize);
      }

      const orbSoftnessLocation = gl.getUniformLocation(
        program,
        "u_orbSoftness"
      );
      if (orbSoftnessLocation) {
        gl.uniform1f(orbSoftnessLocation, uniformsRef.current.orbSoftness);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
