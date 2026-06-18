import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function createNormalMapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  // Base normal blue
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 512, 512);

  // Create brick-like pattern for normal map
  const brickW = 64;
  const brickH = 32;
  for (let y = 0; y < 512; y += brickH) {
    const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
    for (let x = -brickW; x < 512; x += brickW) {
      const bx = x + offset;
      // Brick face (slightly raised)
      const gradient = ctx.createLinearGradient(bx, y, bx + brickW, y + brickH);
      gradient.addColorStop(0, '#9090ff');
      gradient.addColorStop(0.5, '#a0a0ff');
      gradient.addColorStop(1, '#8080ff');
      ctx.fillStyle = gradient;
      ctx.fillRect(bx + 2, y + 2, brickW - 4, brickH - 4);

      // Mortar grooves (darker edges = lower)
      ctx.fillStyle = '#6060ff';
      ctx.fillRect(bx, y, brickW, 2);
      ctx.fillRect(bx, y, 2, brickH);
    }
  }

  // Add some noise for surface detail
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createDiffuseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, 0, 512, 512);

  const brickW = 64;
  const brickH = 32;
  for (let y = 0; y < 512; y += brickH) {
    const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
    for (let x = -brickW; x < 512; x += brickW) {
      const bx = x + offset;
      const hue = 20 + Math.random() * 10;
      const sat = 60 + Math.random() * 20;
      const light = 30 + Math.random() * 15;
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
      ctx.fillRect(bx + 2, y + 2, brickW - 4, brickH - 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const T8_NormalMapWall: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const wallRef = useRef<THREE.Mesh | null>(null);
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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffaa55, 50, 20);
    pointLight.position.set(-3, 2, 4);
    scene.add(pointLight);

    // Normal map wall
    const normalMap = createNormalMapTexture();
    const diffuseMap = createDiffuseTexture();

    const wallGeometry = new THREE.PlaneGeometry(8, 6, 128, 96);
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: diffuseMap,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1.5, 1.5),
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wallRef.current = wall;
    scene.add(wall);

    // Additional decorative panels with normal maps
    const panelGeo = new THREE.BoxGeometry(1.5, 2, 0.2);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughness: 0.5,
      metalness: 0.3,
    });
    const panel1 = new THREE.Mesh(panelGeo, panelMat);
    panel1.position.set(-2.5, 0, 0.5);
    scene.add(panel1);

    const panel2 = new THREE.Mesh(panelGeo, panelMat);
    panel2.position.set(2.5, 0, 0.5);
    scene.add(panel2);

    // Moving light to show off normal map
    const movingLight = new THREE.PointLight(0x44aaff, 30, 15);
    scene.add(movingLight);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = (): void => {
      rafRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      movingLight.position.set(
        Math.sin(time * 0.8) * 4,
        Math.cos(time * 0.6) * 2,
        3 + Math.sin(time * 0.4) * 1
      );

      wall.rotation.y = Math.sin(time * 0.2) * 0.1;
      panel1.rotation.y = Math.sin(time * 0.3) * 0.05;
      panel2.rotation.y = Math.cos(time * 0.3) * 0.05;

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
      wallGeometry.dispose();
      wallMaterial.dispose();
      normalMap.dispose();
      diffuseMap.dispose();
      panelGeo.dispose();
      panelMat.dispose();
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

export default T8_NormalMapWall;
