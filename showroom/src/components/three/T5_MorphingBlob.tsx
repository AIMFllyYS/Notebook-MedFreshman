import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T5_MorphingBlob: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff0080, 50, 20);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0080ff, 50, 20);
    pointLight2.position.set(-3, -2, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x80ff00, 30, 20);
    pointLight3.position.set(0, 3, -2);
    scene.add(pointLight3);

    // Morphing blob geometry
    const geometry = new THREE.IcosahedronGeometry(1.5, 32);
    const positionAttribute = geometry.getAttribute('position');
    const originalPositions = new Float32Array(positionAttribute.count * 3);
    for (let i = 0; i < positionAttribute.count * 3; i++) {
      originalPositions[i] = positionAttribute.array[i];
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.2,
      metalness: 0.6,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Wireframe overlay
    const wireGeometry = new THREE.IcosahedronGeometry(1.52, 8);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    mesh.add(wireMesh);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      const positions = geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const noise1 = Math.sin(ox * 2.0 + time * 1.5) * Math.cos(oy * 2.0 + time * 1.2);
        const noise2 = Math.sin(oy * 2.5 + time * 1.8) * Math.cos(oz * 2.0 + time * 1.0);
        const noise3 = Math.sin(oz * 1.8 + time * 1.3) * Math.cos(ox * 2.2 + time * 1.6);

        const displacement = 1.0 + (noise1 + noise2 + noise3) * 0.15;

        positions.setXYZ(i, ox * displacement, oy * displacement, oz * displacement);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      mesh.rotation.y += 0.003;
      mesh.rotation.x += 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = (): void => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
      geometry.dispose();
      material.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
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

export default T5_MorphingBlob;
