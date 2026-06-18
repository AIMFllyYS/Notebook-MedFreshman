import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T22_ParticleText: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<THREE.Points | null>(null);
  const timeRef = useRef<number>(0);
  const stateRef = useRef<'form' | 'explode' | 'reform'>('form');
  const stateTimeRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 50);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create text on canvas to sample pixels
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 200;
    canvas.height = 100;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('THREE', canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const targetPositions: THREE.Vector3[] = [];
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const idx = (y * canvas.width + x) * 4;
        if (pixels[idx] > 128) {
          targetPositions.push(
            new THREE.Vector3((x - canvas.width / 2) * 0.25, -(y - canvas.height / 2) * 0.25, 0)
          );
        }
      }
    }

    const particleCount = targetPositions.length;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const randomPositions: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const target = targetPositions[i];
      positions[i * 3] = target.x;
      positions[i * 3 + 1] = target.y;
      positions[i * 3 + 2] = target.z;

      const hue = 0.5 + Math.random() * 0.3;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.5 + 0.2;

      randomPositions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 40
        )
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Animation
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      stateTimeRef.current += 0.016;
      const t = timeRef.current;

      // State machine
      if (stateRef.current === 'form' && stateTimeRef.current > 3) {
        stateRef.current = 'explode';
        stateTimeRef.current = 0;
      } else if (stateRef.current === 'explode' && stateTimeRef.current > 2) {
        stateRef.current = 'reform';
        stateTimeRef.current = 0;
      } else if (stateRef.current === 'reform' && stateTimeRef.current > 3) {
        stateRef.current = 'form';
        stateTimeRef.current = 0;
      }

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const state = stateRef.current;
      const st = stateTimeRef.current;

      for (let i = 0; i < particleCount; i++) {
        const target = targetPositions[i];
        const random = randomPositions[i];
        let px: number;
        let py: number;
        let pz: number;

        if (state === 'explode') {
          const progress = Math.min(st / 1.5, 1);
          px = THREE.MathUtils.lerp(target.x, random.x, progress);
          py = THREE.MathUtils.lerp(target.y, random.y, progress);
          pz = THREE.MathUtils.lerp(target.z, random.z, progress);
        } else if (state === 'reform') {
          const progress = Math.min(st / 2, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          px = THREE.MathUtils.lerp(random.x, target.x, ease);
          py = THREE.MathUtils.lerp(random.y, target.y, ease);
          pz = THREE.MathUtils.lerp(random.z, target.z, ease);
        } else {
          // form - subtle float
          px = target.x + Math.sin(t * 2 + i * 0.1) * 0.3;
          py = target.y + Math.cos(t * 1.5 + i * 0.1) * 0.3;
          pz = target.z + Math.sin(t * 1 + i * 0.05) * 0.2;
        }

        posAttr.setXYZ(i, px, py, pz);
      }

      posAttr.needsUpdate = true;
      particles.rotation.z = Math.sin(t * 0.2) * 0.05;
      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
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

export default T22_ParticleText;
