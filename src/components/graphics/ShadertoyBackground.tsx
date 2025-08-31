'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useBodyPortal } from '@/hooks/useBodyPortal'

function FullscreenShaderPlane() {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const { size, viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
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

  const fragmentShader = /* glsl */ `
    precision highp float;

    varying vec2 vUv;
    uniform vec2 u_resolution;
    uniform float u_time;

    // From: https://www.shadertoy.com/view/WdyGzy
    // Alien Beacon by P_Malin
    // License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

    vec3 N13(float p) {
        //  from DAVE HOSKINS
       vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
       p3 += dot(p3, p3.yzx+19.19);
       return fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
    }

    vec4 Voronoi( in vec2 x )
    {
        vec2 n = floor(x);
        vec2 f = fract(x);
        vec3 m = vec3( 8.0 );
        for( int j=-1; j<=1; j++ )
        for( int i=-1; i<=1; i++ )
        {
            vec2  g = vec2( float(i), float(j) );
            vec3  o = N13(n.x+g.x+50.0*(n.y+g.y));
            vec2  r = g - f + o.xy;
            float d = dot(r,r);
            if( d<m.x )
            {
                m = vec3(d, o.z, length(r));
            }
        }
        return vec4(m, length(f-0.5));
    }


    void main() {
        vec2 uv = vUv;
        uv.x *= u_resolution.x/u_resolution.y;

        vec2 p = uv*2.0 - 1.0;

        float t = u_time*0.1;

        vec2 p1 = p;
        p1.x -= t;
        float v1 = Voronoi(p1*5.0).z;

        vec2 p2 = p;
        p2.x += t*1.5;
        float v2 = Voronoi(p2*3.0).x;

        vec2 p3 = p;
        p3.y -= t*0.5;
        float v3 = Voronoi(p3*7.0).y;

        float mix1 = smoothstep(0.1, 0.8, v2);
        float final = mix(v1, v3, mix1);

        vec3 colour = vec3(smoothstep(0.1, 0.9, final));
        colour = pow(colour, vec3(2.0));
        gl_FragColor = vec4(colour,1.0);
    }
  `

  return (
    <mesh position={[0, 0, 0]}>
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

export default function ShadertoyBackground() {
  const container = useBodyPortal({
    id: 'shadertoy-bg-root',
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
      <FullscreenShaderPlane />
    </Canvas>,
    container
  )
}
