"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

interface R3FCanvasProps {
  fragmentShader: string;
  vertexShader?: string;
  uniforms: Record<string, any>;
  isPlaying: boolean;
}

export interface R3FCanvasRef {
  toDataURL: (type?: string, quality?: any) => string;
  canvas: HTMLCanvasElement | null;
}

function Scene({
  fragmentShader,
  vertexShader,
  uniforms,
  isPlaying,
}: R3FCanvasProps) {
  const mesh = useRef<THREE.Mesh>(null);

  // Memoize uniforms structure to avoid re-creating material on every value change
  const uniformStructureKey = Object.keys(uniforms).sort().join(",");

  // Create uniforms object with correct types for Three.js
  const threeUniforms = useMemo(() => {
    const u: Record<string, { value: any }> = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(0, 0) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
    };

    Object.entries(uniforms).forEach(([key, value]) => {
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
  }, [uniformStructureKey]); // Only re-create when keys change, not values

  // Update uniform values on every frame
  useFrame((state) => {
    if (!mesh.current) return;
    if (!isPlaying) return; // Respect isPlaying prop

    const material = mesh.current.material as THREE.ShaderMaterial;
    if (!material.uniforms) return;

    // Update built-ins
    material.uniforms.u_time.value = state.clock.getElapsedTime();
    material.uniforms.u_resolution.value.set(
      state.size.width,
      state.size.height
    );
    material.uniforms.u_mouse.value.set(state.pointer.x, state.pointer.y);

    // Update customs
    Object.entries(uniforms).forEach(([key, value]) => {
      if (material.uniforms[key]) {
        let val = value;
        // Handle vector updates
        if (Array.isArray(value)) {
          const current = material.uniforms[key].value;
          if (current && current.set) {
            if (value.length >= 2)
              current.set(value[0], value[1], value[2] || 0, value[3] || 0);
            return;
          }
          // Fallback for non-vector arrays or re-assignment
          if (value.length === 2) val = new THREE.Vector2(value[0], value[1]);
          else if (value.length === 3)
            val = new THREE.Vector3(value[0], value[1], value[2]);
        }
        material.uniforms[key].value = val;
      }
    });
  });

  // Extract bloom parameters from uniforms with defaults
  const bloomIntensity = uniforms.u_bloomIntensity ?? 2.0;
  const bloomThreshold = uniforms.u_bloomThreshold ?? 0.1;
  const bloomSmoothing = uniforms.u_bloomSmoothing ?? 0.9;

  return (
    <>
      <Sphere args={[1.5, 180, 180]} ref={mesh}>
        <shaderMaterial
          key={uniformStructureKey} // Force remount if structure changes
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={threeUniforms}
          wireframe={false}
        />
      </Sphere>
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={bloomSmoothing}
          mipmapBlur={true}
        />
      </EffectComposer>
    </>
  );
}

// Wrapper component to access the gl context and scene/camera
const CanvasCapture = forwardRef<R3FCanvasRef, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const { gl, scene, camera } = useThree();

    useImperativeHandle(ref, () => ({
      toDataURL: (type, quality) => {
        gl.render(scene, camera); // Force render to ensure buffer is populated
        return gl.domElement.toDataURL(type, quality);
      },
      canvas: gl.domElement,
    }));

    return <>{children}</>;
  }
);
CanvasCapture.displayName = "CanvasCapture";

export const R3FCanvas = forwardRef<R3FCanvasRef, R3FCanvasProps>(
  (props, ref) => {
    return (
      <div className="w-full h-full bg-[#030508]">
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 50 }}
          gl={{ 
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: false,
          }}
          style={{ background: '#030508' }}
        >
          <color attach="background" args={['#030508']} />
          <CanvasCapture ref={ref}>
            <Scene {...props} />
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              minDistance={2.5}
              maxDistance={8}
              autoRotate={false}
            />
          </CanvasCapture>
        </Canvas>
      </div>
    );
  }
);

R3FCanvas.displayName = "R3FCanvas";
