import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T21_MagicTrail: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const trailMeshRef = useRef<THREE.Mesh | null>(null);
  const historyRef = useRef<THREE.Vector3[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 30);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Trail geometry - ribbon
    const maxHistory = 120;
    const ribbonWidth = 1.2;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxHistory * 2 * 3); // 2 vertices per segment
    const colors = new Float32Array(maxHistory * 2 * 3);
    const uvs = new Float32Array(maxHistory * 2 * 2);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setDrawRange(0, 0);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        varying vec2 vUv;
        void main() {
          vColor = color;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying vec2 vUv;
        void main() {
          float alpha = 1.0 - smoothstep(0.0, 1.0, vUv.x);
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const trailMesh = new THREE.Mesh(geometry, material);
    scene.add(trailMesh);
    trailMeshRef.current = trailMesh;

    // Particles following the tip
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = 0;
      pPositions[i * 3 + 1] = 0;
      pPositions[i * 3 + 2] = 0;
      const hue = 0.7 + Math.random() * 0.3;
      const color = new THREE.Color().setHSL(hue, 1.0, 0.6);
      pColors[i * 3] = color.r;
      pColors[i * 3 + 1] = color.g;
      pColors[i * 3 + 2] = color.b;
      pSizes[i] = Math.random() * 0.5 + 0.1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

    const particleMat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Generate trail path
      const x = Math.sin(t * 1.2) * 10 + Math.sin(t * 2.3) * 3;
      const y = Math.cos(t * 0.9) * 6 + Math.sin(t * 1.7) * 3;
      const z = Math.sin(t * 0.5) * 5;
      const currentPos = new THREE.Vector3(x, y, z);

      historyRef.current.unshift(currentPos.clone());
      if (historyRef.current.length > maxHistory) {
        historyRef.current.pop();
      }

      const hist = historyRef.current;
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      const uvAttr = geometry.attributes.uv as THREE.BufferAttribute;

      for (let i = 0; i < hist.length - 1; i++) {
        const p1 = hist[i];
        const p2 = hist[i + 1];
        const dir = new THREE.Vector3().subVectors(p1, p2).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const side = new THREE.Vector3().crossVectors(dir, up).normalize();
        if (side.lengthSq() < 0.001) side.set(1, 0, 0);
        const w = ribbonWidth * (1 - i / maxHistory);

        const idx = i * 2;
        posAttr.setXYZ(idx, p1.x - side.x * w, p1.y - side.y * w, p1.z - side.z * w);
        posAttr.setXYZ(idx + 1, p1.x + side.x * w, p1.y + side.y * w, p1.z + side.z * w);

        const hue = 0.5 + (i / maxHistory) * 0.5;
        const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
        colAttr.setXYZ(idx, color.r, color.g, color.b);
        colAttr.setXYZ(idx + 1, color.r, color.g, color.b);

        uvAttr.setXY(idx, i / maxHistory, 0);
        uvAttr.setXY(idx + 1, i / maxHistory, 1);
      }

      geometry.setDrawRange(0, Math.max(0, (hist.length - 1) * 2));
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      uvAttr.needsUpdate = true;

      // Update particles
      const pPos = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        const target = hist[Math.min(i, hist.length - 1)] || currentPos;
        const jitter = Math.sin(t * 5 + i) * 0.3;
        pPos.setXYZ(
          i,
          target.x + offset.x + jitter,
          target.y + offset.y + jitter,
          target.z + offset.z
        );
      }
      pPos.needsUpdate = true;

      material.uniforms.uTime.value = t;
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
      particleGeo.dispose();
      particleMat.dispose();
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

export default T21_MagicTrail;
