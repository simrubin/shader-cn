"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, forwardRef, useImperativeHandle, useEffect, useState } from "react";
import * as THREE from "three";

interface TextureUniform {
  type: "texture";
  image: HTMLImageElement | null;
  width: number;
  height: number;
}

interface R3FFullscreenCanvasProps {
  fragmentShader: string;
  uniforms: Record<string, any>;
  isPlaying: boolean;
  onFpsUpdate?: (fps: number) => void;
  onError?: (error: string | null) => void;
}

export interface R3FFullscreenCanvasRef {
  toDataURL: (type?: string, quality?: any) => string;
  canvas: HTMLCanvasElement | null;
}

// Simple fullscreen vertex shader
const fullscreenVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

function FullscreenQuad({
  fragmentShader,
  uniforms,
  isPlaying,
  onFpsUpdate,
  onError,
}: R3FFullscreenCanvasProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const texturesRef = useRef<Map<string, THREE.Texture>>(new Map());
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const { size } = useThree();

  // Extract uniform keys for memoization
  const uniformStructureKey = Object.keys(uniforms).sort().join(",");

  // Create Three.js uniforms
  const threeUniforms = useMemo(() => {
    const u: Record<string, { value: any }> = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    };

    Object.entries(uniforms).forEach(([key, value]) => {
      // Skip texture uniforms - we'll handle them separately
      if (value && typeof value === "object" && value.type === "texture") {
        u[key] = { value: null };
        u[key + "Resolution"] = { value: new THREE.Vector2(1, 1) };
        return;
      }

      let val = value;
      if (Array.isArray(value)) {
        if (value.length === 2) val = new THREE.Vector2(value[0], value[1]);
        else if (value.length === 3)
          val = new THREE.Vector3(value[0], value[1], value[2]);
        else if (value.length === 4)
          val = new THREE.Vector4(value[0], value[1], value[2], value[3]);
      }
      u[key] = { value: val };
    });

    return u;
  }, [uniformStructureKey, size.width, size.height]);

  // Handle texture updates
  useEffect(() => {
    Object.entries(uniforms).forEach(([key, value]) => {
      if (value && typeof value === "object" && value.type === "texture") {
        const textureValue = value as TextureUniform;
        if (textureValue.image) {
          let texture = texturesRef.current.get(key);
          
          if (!texture) {
            texture = new THREE.Texture(textureValue.image);
            texture.needsUpdate = true;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texturesRef.current.set(key, texture);
          } else {
            texture.image = textureValue.image;
            texture.needsUpdate = true;
          }

          if (mesh.current) {
            const material = mesh.current.material as THREE.ShaderMaterial;
            if (material.uniforms[key]) {
              material.uniforms[key].value = texture;
            }
            if (material.uniforms[key + "Resolution"]) {
              material.uniforms[key + "Resolution"].value.set(
                textureValue.width,
                textureValue.height
              );
            }
          }
        }
      }
    });
  }, [uniforms]);

  // Update uniforms on every frame
  useFrame((state) => {
    if (!mesh.current) return;
    
    const material = mesh.current.material as THREE.ShaderMaterial;
    if (!material.uniforms) return;

    // Update time only when playing
    if (isPlaying) {
      material.uniforms.u_time.value = state.clock.getElapsedTime();
    }
    
    // Update resolution
    material.uniforms.u_resolution.value.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr
    );
    
    // Update mouse
    material.uniforms.u_mouse.value.set(
      (state.pointer.x + 1) / 2,
      (state.pointer.y + 1) / 2
    );

    // Update custom uniforms
    Object.entries(uniforms).forEach(([key, value]) => {
      // Skip textures - handled in useEffect
      if (value && typeof value === "object" && value.type === "texture") {
        return;
      }
      
      if (material.uniforms[key]) {
        if (Array.isArray(value)) {
          const current = material.uniforms[key].value;
          if (current && current.set) {
            if (value.length === 2) current.set(value[0], value[1]);
            else if (value.length === 3) current.set(value[0], value[1], value[2]);
            else if (value.length === 4) current.set(value[0], value[1], value[2], value[3]);
            return;
          }
        }
        material.uniforms[key].value = value;
      }
    });

    // FPS tracking
    if (onFpsUpdate) {
      frameCountRef.current++;
      const now = Date.now();
      if (now - lastFpsUpdateRef.current > 1000) {
        const fps = Math.round(
          (frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current)
        );
        onFpsUpdate(fps);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
    }
  });

  // Wrap fragment shader with precision
  const wrappedFragmentShader = useMemo(() => {
    // Extract extensions
    const extensionRegex = /^\s*#extension\s+.*$/gm;
    const extensions = fragmentShader.match(extensionRegex) || [];
    const shaderWithoutExtensions = fragmentShader.replace(extensionRegex, "");
    
    return `
      ${extensions.join("\n")}
      precision highp float;
      varying vec2 vUv;
      ${shaderWithoutExtensions}
    `;
  }, [fragmentShader]);

  return (
    <mesh ref={mesh}>
      {/* Fullscreen quad using clip-space coordinates */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={uniformStructureKey}
        fragmentShader={wrappedFragmentShader}
        vertexShader={fullscreenVertexShader}
        uniforms={threeUniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// Wrapper to access gl context for screenshots
const CanvasCapture = forwardRef<
  R3FFullscreenCanvasRef,
  { children: React.ReactNode }
>(({ children }, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    toDataURL: (type, quality) => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL(type, quality);
    },
    canvas: gl.domElement,
  }));

  return <>{children}</>;
});
CanvasCapture.displayName = "CanvasCapture";

export const R3FFullscreenCanvas = forwardRef<
  R3FFullscreenCanvasRef,
  R3FFullscreenCanvasProps
>((props, ref) => {
  const [dpr, setDpr] = useState(1);
  
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio, 2));
  }, []);
  
  return (
    <div className="w-full h-full">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        dpr={dpr}
        style={{ imageRendering: "pixelated" }}
      >
        <CanvasCapture ref={ref}>
          <FullscreenQuad {...props} />
        </CanvasCapture>
      </Canvas>
    </div>
  );
});

R3FFullscreenCanvas.displayName = "R3FFullscreenCanvas";

