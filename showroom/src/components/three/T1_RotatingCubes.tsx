import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T1_RotatingCubes: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Group of cubes
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const count = 64;
    const range = 6;

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / count, 0.8, 0.5),
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * range * 2,
        (Math.random() - 0.5) * range * 2,
        (Math.random() - 0.5) * range * 2
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.02,
      };
      group.add(mesh);
    }

    // Animation loop
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);
      group.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;
        mesh.rotation.z += mesh.userData.rotSpeedZ;
      });
      group.rotation.y += 0.002;
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
      group.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
      });
      geometry.dispose();
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

export default T1_RotatingCubes;
