import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  // Ocean background
  ctx.fillStyle = '#1a4d8c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Simple continents (procedural blobs)
  const continents = [
    { x: 150, y: 150, r: 80 },
    { x: 300, y: 200, r: 100 },
    { x: 500, y: 120, r: 120 },
    { x: 700, y: 180, r: 90 },
    { x: 850, y: 250, r: 70 },
    { x: 200, y: 350, r: 110 },
    { x: 450, y: 380, r: 80 },
    { x: 650, y: 320, r: 100 },
    { x: 900, y: 400, r: 60 },
    { x: 80, y: 280, r: 50 },
  ];

  continents.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = '#2d8a3e';
    ctx.fill();

    // Add some detail
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        c.x + (Math.random() - 0.5) * c.r * 1.5,
        c.y + (Math.random() - 0.5) * c.r * 1.5,
        c.r * (0.3 + Math.random() * 0.4),
        0,
        Math.PI * 2
      );
      ctx.fillStyle = Math.random() > 0.5 ? '#3a9e4d' : '#e8c547';
      ctx.fill();
    }
  });

  // Clouds
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      20 + Math.random() * 60,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const T3_EarthGlobe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020205);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x4455ff, 0.5);
    backLight.position.set(-5, 0, -5);
    scene.add(backLight);

    // Earth
    const earthTexture = createEarthTexture();
    const earthGeometry = new THREE.SphereGeometry(1.8, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthRef.current = earth;
    scene.add(earth);

    // Clouds
    const cloudGeometry = new THREE.SphereGeometry(1.85, 64, 64);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 1.0,
      metalness: 0.0,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudsRef.current = clouds;
    scene.add(clouds);

    // Atmosphere glow
    const atmoGeometry = new THREE.SphereGeometry(1.95, 64, 64);
    const atmoMaterial = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmoGeometry, atmoMaterial);
    scene.add(atmosphere);

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation loop
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);
      earth.rotation.y += 0.002;
      clouds.rotation.y += 0.0025;
      clouds.rotation.x += 0.0005;
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
      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmoGeometry.dispose();
      atmoMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
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

export default T3_EarthGlobe;
