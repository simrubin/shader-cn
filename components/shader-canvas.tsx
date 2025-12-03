"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

interface TextureUniform {
  type: "texture";
  image: HTMLImageElement | null;
  width: number;
  height: number;
}

interface ShaderCanvasProps {
  fragmentShader: string;
  uniforms: Record<string, any>;
  isPlaying: boolean;
  onFpsUpdate?: (fps: number) => void;
  onError?: (error: string | null) => void;
  pixelRatio?: number;
}

export interface ShaderCanvasRef {
  toDataURL: (type?: string, quality?: any) => string;
  canvas: HTMLCanvasElement | null;
}

export const ShaderCanvas = forwardRef<ShaderCanvasRef, ShaderCanvasProps>(
  (
    {
      fragmentShader,
      uniforms,
      isPlaying,
      onFpsUpdate,
      onError,
      pixelRatio: customPixelRatio,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const startTimeRef = useRef(Date.now());
    const frameCountRef = useRef(0);
    const lastFpsUpdateRef = useRef(Date.now());
    const mouseRef = useRef({ x: 0.5, y: 0.5, pressed: 0 });
    const animationFrameRef = useRef<number | undefined>(undefined);
    const texturesRef = useRef<Map<string, WebGLTexture>>(new Map());

    useImperativeHandle(ref, () => ({
      toDataURL: (type, quality) => {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL(type, quality);
        }
        return "";
      },
      canvas: canvasRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl =
        canvas.getContext("webgl2", { preserveDrawingBuffer: true }) ||
        canvas.getContext("webgl", { preserveDrawingBuffer: true }) ||
        canvas.getContext("experimental-webgl", {
          preserveDrawingBuffer: true,
        });
      if (!gl) {
        if (onError) onError("WebGL not supported");
        return;
      }

      // Enable standard derivatives extension if available (needed for WebGL1)
      // @ts-ignore
      gl.getExtension("OES_standard_derivatives");

      glRef.current = gl as WebGLRenderingContext;

      const handleResize = () => {
        if (!canvas) return;
        // Cap pixel ratio at 1.5 for performance on high-DPI screens (Raymarching is heavy)
        // Unless custom pixel ratio is provided for high-res exports
        const pixelRatio =
          customPixelRatio || Math.min(window.devicePixelRatio, 1.5);
        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;
        (gl as WebGLRenderingContext).viewport(
          0,
          0,
          canvas.width,
          canvas.height
        );
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = (e.clientX - rect.left) / rect.width;
        mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
      };

      const handleMouseDown = () => {
        mouseRef.current.pressed = 1;
      };

      const handleMouseUp = () => {
        mouseRef.current.pressed = 0;
      };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [customPixelRatio, onError]);

    useEffect(() => {
      const gl = glRef.current;
      if (!gl) return;

      const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      if (!vertexShader) return;

      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);

      // Extract extensions from the fragment shader code
      const extensionRegex = /^\s*#extension\s+.*$/gm;
      const extensions = fragmentShader.match(extensionRegex) || [];
      const shaderWithoutExtensions = fragmentShader.replace(
        extensionRegex,
        ""
      );

      const fragmentShaderWithPrecision = `
      ${extensions.join("\n")}
      precision highp float;
      ${shaderWithoutExtensions}
    `;

      const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fragShader) return;

      gl.shaderSource(fragShader, fragmentShaderWithPrecision);
      gl.compileShader(fragShader);

      if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragShader);
        if (onError) onError(error || "Shader compilation failed");
        gl.deleteShader(fragShader);
        return;
      }

      if (onError) onError(null);

      const program = gl.createProgram();
      if (!program) return;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        if (onError) onError(error || "Program linking failed");
        return;
      }

      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }
      programRef.current = program;

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
    }, [fragmentShader, onError]);

    useEffect(() => {
      const gl = glRef.current;
      const program = programRef.current;
      if (!gl || !program) return;

      let animationFrame: number;

      const render = () => {
        const currentTime = Date.now();
        const elapsed = (currentTime - startTimeRef.current) / 1000;

        gl.useProgram(program);

        // Set built-in uniforms
        const timeLocation = gl.getUniformLocation(program, "u_time");
        if (timeLocation) gl.uniform1f(timeLocation, elapsed);

        const resolutionLocation = gl.getUniformLocation(
          program,
          "u_resolution"
        );
        if (resolutionLocation) {
          gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        }

        const mouseLocation = gl.getUniformLocation(program, "u_mouse");
        if (mouseLocation) {
          gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);
        }

        const mousePressedLocation = gl.getUniformLocation(
          program,
          "u_mousePressed"
        );
        if (mousePressedLocation) {
          gl.uniform1f(mousePressedLocation, mouseRef.current.pressed);
        }

        // Set custom uniforms
        let textureUnit = 0;
        Object.entries(uniforms).forEach(([name, value]) => {
          const location = gl.getUniformLocation(program, name);
          if (!location) return;

          if (typeof value === "number") {
            gl.uniform1f(location, value);
          } else if (typeof value === "boolean") {
            gl.uniform1f(location, value ? 1.0 : 0.0);
          } else if (Array.isArray(value)) {
            if (value.length === 2) {
              gl.uniform2f(location, value[0], value[1]);
            } else if (value.length === 3) {
              gl.uniform3f(location, value[0], value[1], value[2]);
            } else if (value.length === 4) {
              gl.uniform4f(location, value[0], value[1], value[2], value[3]);
            }
          } else if (
            value &&
            typeof value === "object" &&
            value.type === "texture"
          ) {
            // Handle texture uniforms
            const textureValue = value as TextureUniform;
            if (textureValue.image) {
              let texture = texturesRef.current.get(name);

              // Create or update texture
              if (!texture) {
                texture = gl.createTexture()!;
                texturesRef.current.set(name, texture);
              }

              gl.activeTexture(gl.TEXTURE0 + textureUnit);
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                textureValue.image
              );

              // Set texture parameters for non-power-of-two images
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE
              );
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE
              );
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

              gl.uniform1i(location, textureUnit);
              textureUnit++;

              // Set image resolution uniform if it exists
              const resolutionLocation = gl.getUniformLocation(
                program,
                name + "Resolution"
              );
              if (resolutionLocation) {
                gl.uniform2f(
                  resolutionLocation,
                  textureValue.width,
                  textureValue.height
                );
              }
            }
          }
        });

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Update FPS
        frameCountRef.current++;
        if (currentTime - lastFpsUpdateRef.current > 1000) {
          const fps = Math.round(
            (frameCountRef.current * 1000) /
              (currentTime - lastFpsUpdateRef.current)
          );
          if (onFpsUpdate) onFpsUpdate(fps);
          frameCountRef.current = 0;
          lastFpsUpdateRef.current = currentTime;
        }

        if (isPlaying) {
          animationFrame = requestAnimationFrame(render);
        }
      };

      // If not playing, render at least once
      if (!isPlaying) {
        requestAnimationFrame(render);
      } else {
        render();
      }

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [uniforms, isPlaying, fragmentShader, onFpsUpdate]);

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-black"
        style={{ imageRendering: "pixelated" }}
      />
    );
  }
);

ShaderCanvas.displayName = "ShaderCanvas";
