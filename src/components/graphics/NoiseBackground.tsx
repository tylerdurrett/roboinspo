'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useBodyPortal } from '@/hooks/useBodyPortal'

function FullscreenNoisePlane() {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const { size, viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
      u_baseColor: { value: new THREE.Color(0x0a0b0d) }, // very dark bluish-gray
      u_noiseIntensity: { value: 0.12 },
      u_contrast: { value: 1.1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Keep resolution up to date on resize
  if (materialRef.current) {
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
  }

  useFrame((state) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime()
  })

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // Fragment shader: fBM noise with slow drift. Mostly dark with subtle grain.
  const fragmentShader = /* glsl */ `
    precision highp float;

    varying vec2 vUv;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec3 u_baseColor;
    uniform float u_noiseIntensity;
    uniform float u_contrast;

    // Hash and noise helpers (value noise)
    float hash(vec2 p) {
      // Dave Hoskins style hash
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p.x) * 43758.5453123 + sin(p.y) * 12345.6789);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      // Smoothstep for interpolation
      vec2 u = f * f * (3.0 - 2.0 * f);

      float a = hash(i + vec2(0.0, 0.0));
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv;
      // Make pixels square in case of non-square resolution
      vec2 p = (gl_FragCoord.xy / u_resolution.xy);
      // Center and scale a bit for texture detail
      vec2 q = (p - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0) * 1.2;

      // Slow drift to animate
      float t = u_time * 0.05;

      // Layer multiple fbm samples for grungy look
      float n1 = fbm(q * 2.0 + vec2(t * 1.1, -t * 0.9));
      float n2 = fbm(q * 4.0 - vec2(t * 0.7, t * 1.3));
      float n3 = fbm(q * 8.0 + vec2(-t * 1.5, t * 0.5));

      float n = (n1 * 0.6 + n2 * 0.3 + n3 * 0.1);

      // Subtle high-frequency grain
      float grain = noise(q * 50.0 + t * 10.0) * 0.04;

      float luminance = clamp(n * u_noiseIntensity + grain, 0.0, 1.0);
      // Apply a gentle contrast curve
      luminance = pow(luminance, 1.0 / u_contrast);

      vec3 color = u_baseColor + vec3(luminance);
      // Keep it dark; cap intensity
      color = mix(u_baseColor, color, 0.6);

      gl_FragColor = vec4(color, 1.0);
    }
  `

  return (
    <mesh position={[0, 0, 0]}>
      {/* Make plane span the current viewport in orthographic units */}
      <planeGeometry args={[viewport.width, viewport.height, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        transparent={false}
      />
    </mesh>
  )
}

export default function NoiseBackground() {
  const container = useBodyPortal({
    id: 'noise-bg-root',
    className: 'pointer-events-none fixed inset-0 z-0',
    tag: 'div',
    removeOnUnmount: true,
  })

  if (!container) return null

  return createPortal(
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      dpr={[
        1,
        Math.min(
          typeof window !== 'undefined' ? window.devicePixelRatio : 1,
          2
        ),
      ]}
      gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
      className="h-full w-full"
    >
      <FullscreenNoisePlane />
    </Canvas>,
    container
  )
}
