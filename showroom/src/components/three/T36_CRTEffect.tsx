import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// CRT monitor effect shader
const crtShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    time: { value: 0.0 },
    resolution: { value: new THREE.Vector2(1, 1) },
    curvature: { value: 4.0 },
    scanlineIntensity: { value: 0.15 },
    rgbShift: { value: 0.003 },
    vignette: { value: 0.4 },
    noiseIntensity: { value: 0.08 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform vec2 resolution;
    uniform float curvature;
    uniform float scanlineIntensity;
    uniform float rgbShift;
    uniform float vignette;
    uniform float noiseIntensity;
    varying vec2 vUv;

    vec2 curve(vec2 uv) {
      uv = (uv - 0.5) * 2.0;
      uv *= 1.1;
      uv.x *= 1.0 + pow((abs(uv.y) / curvature), 2.0);
      uv.y *= 1.0 + pow((abs(uv.x) / curvature), 2.0);
      uv = (uv / 2.0) + 0.5;
      return uv;
    }

    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = curve(vUv);

      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // RGB shift / chromatic aberration
      float r = texture2D(tDiffuse, uv + vec2(rgbShift, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(rgbShift, 0.0)).b;
      vec3 color = vec3(r, g, b);

      // Scanlines
      float scanline = sin(uv.y * resolution.y * 1.5 + time * 10.0) * 0.5 + 0.5;
      color *= 1.0 - (scanline * scanlineIntensity);

      // Horizontal scanline bands
      float band = sin(uv.y * resolution.y * 0.7) * 0.5 + 0.5;
      color *= 0.95 + band * 0.05;

      // Vignette
      vec2 vignetteUV = uv * (1.0 - uv.yx);
      float vig = vignetteUV.x * vignetteUV.y * 15.0;
      vig = pow(vig, vignette);
      color *= vig;

      // Noise
      float noise = random(uv + time) * noiseIntensity;
      color += noise;

      // Slight brightness boost
      color *= 1.1;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

const T36_CRTEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const crtPass = new ShaderPass(crtShader);
    crtPass.uniforms['resolution'].value.set(width, height);
    composer.addPass(crtPass);
    composerRef.current = composer;

    // Retro 3D scene content
    const geo = new THREE.IcosahedronGeometry(1.5, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const innerGeo = new THREE.IcosahedronGeometry(1.0, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff0066,
      wireframe: true,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // Grid floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x004444);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Floating particles
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0xffff00, size: 0.05 });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    let time = 0;
    const animate = () => {
      time += 0.016;
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.015;
      innerMesh.rotation.x -= 0.02;
      innerMesh.rotation.y -= 0.01;
      gridHelper.position.z = (time * 2) % 2;

      crtPass.uniforms['time'].value = time;

      composer.render();
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      crtPass.uniforms['resolution'].value.set(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      composer.dispose();
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
};

export default T36_CRTEffect;
