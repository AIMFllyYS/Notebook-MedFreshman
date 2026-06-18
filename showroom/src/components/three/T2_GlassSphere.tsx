import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const T2_GlassSphere: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xffaa00, 50);
    pointLight2.position.set(-5, -3, 2);
    scene.add(pointLight2);

    // Glass sphere
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 1.0,
      thickness: 1.5,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.0,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphereRef.current = sphere;
    scene.add(sphere);

    // Inner sphere for visual interest
    const innerGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x002244,
      roughness: 0.4,
      metalness: 0.8,
    });
    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    sphere.add(innerSphere);

    // Animation loop
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);
      sphere.rotation.y += 0.005;
      sphere.rotation.x += 0.002;
      innerSphere.rotation.y -= 0.01;
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
      innerGeometry.dispose();
      innerMaterial.dispose();
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

export default T2_GlassSphere;
